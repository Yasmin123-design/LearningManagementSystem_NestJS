import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { QuizSubmission } from './quiz-submission.entity';
import { Question } from './question.entity';
import { Option } from './option.entity';

@Entity('quiz_answers')
export class QuizAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  submissionId: string;

  @ManyToOne(() => QuizSubmission, (submission) => submission.answers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'submissionId' })
  submission: QuizSubmission;

  @Column()
  questionId: string;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'questionId' })
  question: Question;

  @Column({ nullable: true })
  optionId: string;

  @ManyToOne(() => Option)
  @JoinColumn({ name: 'optionId' })
  option: Option;

  @CreateDateColumn()
  createdAt: Date;
}
