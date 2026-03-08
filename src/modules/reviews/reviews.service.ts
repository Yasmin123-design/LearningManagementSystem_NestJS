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
import { UpdateReviewDto } from './dto/update-review.dto';
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

  async create(
    userId: string,
    createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    const { courseId, rating, comment } = createReviewDto;

    const isEnrolled = await this.enrollmentsService.checkAccess(
      userId,
      courseId,
    );
    if (!isEnrolled) {
      throw new BadRequestException(
        'You must be enrolled in the course to review it',
      );
    }

    const review = this.reviewRepository.create({
      userId,
      courseId,
      rating,
      comment,
    });
    const savedReview = await this.reviewRepository.save(review);

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

  async findMyReviews(userId: string): Promise<Review[]> {
    console.log(`Finding reviews for userId: ${userId}`);
    try {
      const reviews = await this.reviewRepository.find({
        where: { userId },
        relations: ['course'],
        order: { createdAt: 'DESC' },
      });
      console.log(`Found ${reviews.length} reviews`);
      return reviews;
    } catch (error) {
      console.error('Error in findMyReviews:', error);
      throw error;
    }
  }

  async update(
    reviewId: string,
    userId: string,
    updateReviewDto: UpdateReviewDto,
    isAdmin: boolean = false,
  ): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId && !isAdmin) {
      throw new ConflictException('You can only update your own reviews');
    }

    Object.assign(review, updateReviewDto);
    const updatedReview = await this.reviewRepository.save(review);

    await this.recalculateAverageRating(review.courseId);

    return updatedReview;
  }

  async remove(
    reviewId: string,
    userId: string,
    isAdmin: boolean = false,
  ): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId && !isAdmin) {
      throw new ConflictException('You can only delete your own reviews');
    }

    const courseId = review.courseId;
    await this.reviewRepository.remove(review);

    await this.recalculateAverageRating(courseId);
  }

  private async recalculateAverageRating(courseId: string): Promise<void> {
    const reviews = await this.reviewRepository.find({ where: { courseId } });
    if (reviews.length === 0) return;

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = parseFloat((sum / reviews.length).toFixed(1));

    await this.coursesService.updateAverageRating(courseId, average);
  }
}
