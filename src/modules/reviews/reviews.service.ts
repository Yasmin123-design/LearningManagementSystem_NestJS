import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { CoursesService } from '../courses/courses.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly enrollmentsService: EnrollmentsService,
    private readonly coursesService: CoursesService,
  ) {}

  async create(userId: string, createReviewDto: CreateReviewDto): Promise<Review> {
    const { courseId, rating, comment } = createReviewDto;

    // 1. Check if user is enrolled
    const isEnrolled = await this.enrollmentsService.checkAccess(userId, courseId);
    if (!isEnrolled) {
      throw new BadRequestException('You must be enrolled in the course to review it');
    }

    // 2. Check if user already reviewed
    const existingReview = await this.reviewRepository.findOne({
      where: { userId, courseId },
    });
    if (existingReview) {
      throw new ConflictException('You have already reviewed this course');
    }

    // 3. Create review
    const review = this.reviewRepository.create({
      userId,
      courseId,
      rating,
      comment,
    });
    const savedReview = await this.reviewRepository.save(review);

    // 4. Recalculate average rating
    await this.recalculateAverageRating(courseId);

    return savedReview;
  }

  async findByCourse(courseId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { courseId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  private async recalculateAverageRating(courseId: string): Promise<void> {
    const reviews = await this.reviewRepository.find({ where: { courseId } });
    if (reviews.length === 0) return;

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = parseFloat((sum / reviews.length).toFixed(1));

    await this.coursesService.updateAverageRating(courseId, average);
  }
}
