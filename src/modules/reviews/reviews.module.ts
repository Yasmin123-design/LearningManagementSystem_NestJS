import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from './entities/review.entity';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review]),
    EnrollmentsModule,
    CoursesModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
