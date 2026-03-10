import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Patch,
  Delete,
  Req,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { UpdateOptionDto } from './dto/update-option.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AtGuard } from '../auth/guards/at.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
@ApiTags('quizzes')
@ApiBearerAuth()
@Controller()
@UseGuards(AtGuard, RolesGuard)
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post('lessons/:lessonId/quiz')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Create a quiz for a specific lesson' })
  create(
    @Param('lessonId') lessonId: string,
    @Body() createQuizDto: CreateQuizDto,
  ) {
    return this.quizzesService.createQuiz(lessonId, createQuizDto);
  }

  @Get('lessons/:lessonId/quiz')
  @Roles(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Get quiz details by lesson ID' })
  getByLesson(@Param('lessonId') lessonId: string) {
    return this.quizzesService.findByLesson(lessonId);
  }

  @Post('quizzes/:quizId/submit')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Submit answers for a quiz' })
  submit(
    @Param('quizId') quizId: string,
    @Body() submitQuizDto: SubmitQuizDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.quizzesService.submitQuiz(quizId, userId, submitQuizDto);
  }

  @Get('quizzes/:quizId/result')
  @Roles(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Get student result for a quiz' })
  getResult(
    @Param('quizId') quizId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.quizzesService.getQuizResult(quizId, userId);
  }

  @Patch('quizzes/:id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Update quiz details' })
  update(@Param('id') id: string, @Body() updateQuizDto: UpdateQuizDto) {
    return this.quizzesService.update(id, updateQuizDto);
  }

  @Post('quizzes/:id/questions')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Add a question to a quiz' })
  addQuestion(
    @Param('id') id: string,
    @Body('text') text: string,
    @Body('points') points: number,
  ) {
    return this.quizzesService.addQuestion(id, text, points);
  }

  @Patch('quizzes/questions/:questionId')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Update a question' })
  updateQuestion(
    @Param('questionId') questionId: string,
    @Body() updateDto: UpdateQuestionDto,
  ) {
    return this.quizzesService.updateQuestion(questionId, updateDto);
  }

  @Delete('quizzes/questions/:questionId')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Delete a question' })
  removeQuestion(@Param('questionId') questionId: string) {
    return this.quizzesService.removeQuestion(questionId);
  }

  @Post('quizzes/questions/:questionId/options')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Add an option to a question' })
  addOption(
    @Param('questionId') questionId: string,
    @Body('text') text: string,
    @Body('isCorrect') isCorrect: boolean,
  ) {
    return this.quizzesService.addOption(questionId, text, isCorrect);
  }

  @Patch('quizzes/options/:optionId')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Update an option' })
  updateOption(
    @Param('optionId') optionId: string,
    @Body() updateDto: UpdateOptionDto,
  ) {
    return this.quizzesService.updateOption(optionId, updateDto);
  }

  @Delete('quizzes/options/:optionId')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Delete an option' })
  removeOption(@Param('optionId') optionId: string) {
    return this.quizzesService.removeOption(optionId);
  }

  @Delete('quizzes/:id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Delete a quiz' })
  remove(@Param('id') id: string) {
    return this.quizzesService.remove(id);
  }
}
