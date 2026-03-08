import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Module as CourseModule } from '../../modules/entities/module.entity';

export enum LessonType {
  VIDEO = 'video',
  TEXT = 'text',
  PDF = 'pdf',
  QUIZ = 'quiz',
}

@Entity('lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ nullable: true })
  Url: string;

  @Column({
    type: 'enum',
    enum: LessonType,
    default: LessonType.VIDEO,
  })
  type: LessonType;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column()
  moduleId: string;

  @ManyToOne(() => CourseModule, (module) => module.lessons)
  @JoinColumn({ name: 'moduleId' })
  module: CourseModule;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
