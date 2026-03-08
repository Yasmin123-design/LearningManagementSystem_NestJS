import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Question } from './question.entity';

@Entity('options')
export class Option {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  text: string;

  @Column({ default: false })
  isCorrect: boolean;

  @Column()
  questionId: string;

  @ManyToOne(() => Question, (question) => question.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionId' })
  question: Question;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
