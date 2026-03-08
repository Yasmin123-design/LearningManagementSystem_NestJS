import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Lesson } from '../../lessons/entities/lesson.entity';
import { Question } from './question.entity';

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  passingScore: number;

  @Column()
  lessonId: string;

  @OneToOne(() => Lesson)
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson;

  @OneToMany(() => Question, (question) => question.quiz, { cascade: true })
  questions: Question[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
