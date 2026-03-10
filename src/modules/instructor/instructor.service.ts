import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../courses/entities/course.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { Review } from '../reviews/entities/review.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class InstructorService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getCourses(instructorId: string): Promise<Course[]> {
    return this.courseRepository.find({
      where: { instructorId },
      order: { createdAt: 'DESC' },
    });
  }

  async getStats(instructorId: string) {
    const courses = await this.courseRepository.find({
      where: { instructorId },
      select: ['id', 'price'],
    });

    const courseIds = courses.map((c) => c.id);

    if (courseIds.length === 0) {
      return {
        totalEarnings: 0,
        totalStudents: 0,
        averageRating: 0,
      };
    }

    const { totalStudents } = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .select('COUNT(DISTINCT enrollment.userId)', 'totalStudents')
      .where('enrollment.courseId IN (:...courseIds)', { courseIds })
      .getRawOne();

    const enrollments = await this.enrollmentRepository.find({
      where: {
        courseId: courseIds as any,
        isPaid: true,
      },
      relations: ['course'],
    });

    const totalEarnings = enrollments.reduce((sum, enrollment) => {
      return sum + Number(enrollment.course.price || 0);
    }, 0);

    const { averageRating } = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'averageRating')
      .where('review.courseId IN (:...courseIds)', { courseIds })
      .getRawOne();

    return {
      totalEarnings,
      totalStudents: parseInt(totalStudents) || 0,
      averageRating: parseFloat(averageRating) || 0,
    };
  }

  async getPublicProfile(instructorId: string) {
    const instructor = await this.userRepository.findOne({
      where: { id: instructorId },
      select: ['id', 'email', 'role', 'createdAt'],
    });

    if (!instructor) {
      throw new NotFoundException('Instructor not found');
    }

    const courses = await this.courseRepository.find({
      where: { instructorId, isPublished: true },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });

    const courseIds = courses.map((c) => c.id);

    let averageRating = 0;
    let totalReviews = 0;

    if (courseIds.length > 0) {
      const { avg, count } = await this.reviewRepository
        .createQueryBuilder('review')
        .select('AVG(review.rating)', 'avg')
        .addSelect('COUNT(review.id)', 'count')
        .where('review.courseId IN (:...courseIds)', { courseIds })
        .getRawOne();

      averageRating = parseFloat(avg) || 0;
      totalReviews = parseInt(count) || 0;
    }

    return {
      instructor: {
        id: instructor.id,
        email: instructor.email,
        memberSince: instructor.createdAt,
      },
      courses,
      stats: {
        totalCourses: courses.length,
        averageRating,
        totalReviews,
      },
    };
  }
}
