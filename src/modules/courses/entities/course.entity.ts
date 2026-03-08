import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Module as CourseModule } from '../../modules/entities/module.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  thumbnail: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ default: false })
  isPremium: boolean;

  @Column({ default: false })
  isPublished: boolean;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  averageRating: number;

  @Column()
  instructorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'instructorId' })
  instructor: User;

  @Column()
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.courses)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToMany(() => CourseModule, (module) => module.course)
  modules: CourseModule[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
