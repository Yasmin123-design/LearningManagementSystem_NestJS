import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Quiz } from './entities/quiz.entity';
import { Question } from './entities/question.entity';
import { Option } from './entities/option.entity';
import { QuizSubmission } from './entities/quiz-submission.entity';
import { QuizAnswer } from './entities/quiz-answer.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { UpdateOptionDto } from './dto/update-option.dto';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { Inject, forwardRef } from '@nestjs/common';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    @InjectRepository(QuizSubmission)
    private submissionRepository: Repository<QuizSubmission>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Option)
    private optionRepository: Repository<Option>,
    private dataSource: DataSource,
    @Inject(forwardRef(() => EnrollmentsService))
    private readonly enrollmentsService: EnrollmentsService,
  ) {}

  async createQuiz(
    lessonId: string,
    createQuizDto: CreateQuizDto,
  ): Promise<Quiz> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const quiz = queryRunner.manager.create(Quiz, {
        ...createQuizDto,
        lessonId,
      });

      const savedQuiz = await queryRunner.manager.save(Quiz, quiz);

      if (createQuizDto.questions) {
        for (const qDto of createQuizDto.questions) {
          const question = queryRunner.manager.create(Question, {
            text: qDto.text,
            points: qDto.points || 1,
            quizId: savedQuiz.id,
          });
          const savedQuestion = await queryRunner.manager.save(
            Question,
            question,
          );

          if (qDto.options) {
            for (const oDto of qDto.options) {
              const option = queryRunner.manager.create(Option, {
                text: oDto.text,
                isCorrect: oDto.isCorrect || false,
                questionId: savedQuestion.id,
              });
              await queryRunner.manager.save(Option, option);
            }
          }
        }
      }

      await queryRunner.commitTransaction();
      return this.findOne(savedQuiz.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findByLesson(lessonId: string): Promise<Quiz> {
    const quiz = await this.quizRepository.findOne({
      where: { lessonId },
      relations: ['questions', 'questions.options'],
    });
    if (!quiz) {
      throw new NotFoundException('No quiz found for this lesson');
    }
    return quiz;
  }

  async findOne(id: string): Promise<Quiz> {
    const quiz = await this.quizRepository.findOne({
      where: { id },
      relations: ['questions', 'questions.options'],
    });
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }
    return quiz;
  }

  async submitQuiz(
    quizId: string,
    userId: string,
    submitQuizDto: SubmitQuizDto,
  ) {
    const quiz = await this.quizRepository.findOne({
      where: { id: quizId },
      relations: ['questions', 'questions.options'],
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    let totalScore = 0;
    let earnedScore = 0;
    const answers: Partial<QuizAnswer>[] = [];

    for (const question of quiz.questions) {
      totalScore += question.points;
      const studentAnswer = submitQuizDto.answers.find(
        (a) => a.questionId === question.id,
      );

      if (studentAnswer) {
        const selectedOption = question.options.find(
          (o) => o.id === studentAnswer.optionId,
        );
        if (selectedOption?.isCorrect) {
          earnedScore += question.points;
        }

        answers.push({
          questionId: question.id,
          optionId: studentAnswer.optionId,
        });
      }
    }

    const percentage = (earnedScore / (totalScore || 1)) * 100;
    const isPassed = percentage >= quiz.passingScore;

    const submission = this.submissionRepository.create({
      quizId,
      userId,
      score: percentage,
      isPassed,
      answers: answers as QuizAnswer[],
    });

    const savedSubmission = await this.submissionRepository.save(submission);

    // If passed, mark the lesson as completed
    if (isPassed) {
      await this.enrollmentsService.completeLesson(userId, quiz.lessonId);
    }

    return savedSubmission;
  }

  async getQuizResult(quizId: string, userId: string) {
    const submission = await this.submissionRepository.findOne({
      where: { quizId, userId },
      order: { createdAt: 'DESC' },
      relations: ['answers'],
    });

    if (!submission) {
      throw new NotFoundException('No submission found for this quiz');
    }

    return submission;
  }

  // Management Methods

  async update(id: string, updateQuizDto: UpdateQuizDto): Promise<Quiz> {
    const quiz = await this.findOne(id);
    Object.assign(quiz, updateQuizDto);
    return this.quizRepository.save(quiz);
  }

  async remove(id: string): Promise<void> {
    const result = await this.quizRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Quiz not found');
    }
  }

  async addQuestion(quizId: string, text: string, points: number = 1): Promise<Question> {
    const quiz = await this.findOne(quizId);
    const question = this.questionRepository.create({
      text,
      points,
      quizId: quiz.id,
    });
    return this.questionRepository.save(question);
  }

  async updateQuestion(questionId: string, updateDto: UpdateQuestionDto): Promise<Question> {
    const question = await this.questionRepository.findOne({ where: { id: questionId } });
    if (!question) throw new NotFoundException('Question not found');
    Object.assign(question, updateDto);
    return this.questionRepository.save(question);
  }

  async removeQuestion(questionId: string): Promise<void> {
    const result = await this.questionRepository.delete(questionId);
    if (result.affected === 0) throw new NotFoundException('Question not found');
  }

  async addOption(questionId: string, text: string, isCorrect: boolean = false): Promise<Option> {
    const question = await this.questionRepository.findOne({ where: { id: questionId } });
    if (!question) throw new NotFoundException('Question not found');
    const option = this.optionRepository.create({
      text,
      isCorrect,
      questionId: question.id,
    });
    return this.optionRepository.save(option);
  }

  async updateOption(optionId: string, updateDto: UpdateOptionDto): Promise<Option> {
    const option = await this.optionRepository.findOne({ where: { id: optionId } });
    if (!option) throw new NotFoundException('Option not found');
    Object.assign(option, updateDto);
    return this.optionRepository.save(option);
  }

  async removeOption(optionId: string): Promise<void> {
    const result = await this.optionRepository.delete(optionId);
    if (result.affected === 0) throw new NotFoundException('Option not found');
  }
}
