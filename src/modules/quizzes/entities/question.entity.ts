import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Quiz } from './quiz.entity';
import { Option } from './option.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'int', default: 1 })
  points: number;

  @Column()
  quizId: string;

  @ManyToOne(() => Quiz, (quiz) => quiz.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quizId' })
  quiz: Quiz;

  @OneToMany(() => Option, (option) => option.question, { cascade: true })
  options: Option[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
