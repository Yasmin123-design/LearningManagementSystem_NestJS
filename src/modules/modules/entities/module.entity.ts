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
import { Course } from '../../courses/entities/course.entity';
import { Lesson } from '../../lessons/entities/lesson.entity';

@Entity('modules')
export class Module {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column()
  courseId: string;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @OneToMany(() => Lesson, (lesson) => lesson.module)
  lessons: Lesson[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
