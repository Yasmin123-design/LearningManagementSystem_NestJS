import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstructorService } from './instructor.service';
import { InstructorController, InstructorPublicController } from './instructor.controller';
import { Course } from '../courses/entities/course.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { Review } from '../reviews/entities/review.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Enrollment, Review, User])],
  controllers: [InstructorController, InstructorPublicController],
  providers: [InstructorService],
})
export class InstructorModule {}
