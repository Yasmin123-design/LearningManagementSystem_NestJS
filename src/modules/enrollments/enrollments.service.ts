import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { CoursesService } from '../courses/courses.service';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    private readonly coursesService: CoursesService,
    private readonly dataSource: DataSource,
  ) {}

  async enroll(
    userId: string,
    createEnrollmentDto: CreateEnrollmentDto,
  ): Promise<Enrollment> {
    const course = await this.coursesService.findOne(
      createEnrollmentDto.courseId,
    );

    if (!course.isPublished) {
      throw new BadRequestException('Cannot enroll in an unpublished course');
    }

    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: { userId, courseId: createEnrollmentDto.courseId },
    });

    if (existingEnrollment) {
      throw new ConflictException('You are already enrolled in this course');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const enrollment = this.enrollmentRepository.create({
        userId,
        courseId: createEnrollmentDto.courseId,
        isPaid: !course.isPremium,
      });

      const savedEnrollment = await queryRunner.manager.save(enrollment);
      await queryRunner.commitTransaction();
      return savedEnrollment;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getMyEnrollments(userId: string): Promise<Enrollment[]> {
    return this.enrollmentRepository.find({
      where: { userId },
      relations: ['course', 'course.category', 'course.instructor'],
    });
  }

  async updateProgress(
    userId: string,
    courseId: string,
    progress: number,
  ): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { userId, courseId },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (progress < 0 || progress > 100) {
      throw new BadRequestException('Progress must be between 0 and 100');
    }

    enrollment.progress = progress;
    return this.enrollmentRepository.save(enrollment);
  }

  async checkAccess(userId: string, courseId: string): Promise<boolean> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { userId, courseId },
    });

    if (!enrollment) return false;

    const course = await this.coursesService.findOne(courseId);
    if (course.isPremium && !enrollment.isPaid) return false;

    return true;
  }

  async markAsPaid(userId: string, courseId: string): Promise<void> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { userId, courseId },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    enrollment.isPaid = true;
    await this.enrollmentRepository.save(enrollment);
  }
}
