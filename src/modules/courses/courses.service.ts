import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, FindOptionsWhere } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { GetCourseQueryDto } from './dto/get-course-query.dto';
import { PageDto, PaginationMetaDto } from '../../common/dtos/page.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(
    createCourseDto: CreateCourseDto,
    instructorId: string,
  ): Promise<Course> {
    const course = this.courseRepository.create({
      ...createCourseDto,
      instructorId,
    });
    const newCourse = await this.courseRepository.save(course);
    return newCourse;
  }

  async findAllPublishedAndUnPublished(
    query: GetCourseQueryDto,
    userId?: string,
  ): Promise<PageDto<Course>> {
    const where: any = {};
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.search) where.title = Like(`%${query.search}%`);
    if (query.isPremium !== undefined) where.isPremium = query.isPremium;
    if (query.minPrice !== undefined && query.maxPrice !== undefined) {
      where.price = Between(query.minPrice, query.maxPrice);
    }

    const [courses, itemCount] = await this.courseRepository.findAndCount({
      where,
      relations: ['category', 'instructor'],
      order: { createdAt: query.order },
      skip: query.skip,
      take: query.take,
    });

    await this._mapMetadata(courses, userId);

    const pageMetaDto = new PaginationMetaDto({
      itemCount,
      pageOptionsDto: query,
    });
    return new PageDto(courses, pageMetaDto);
  }

  async findAll(
    query: GetCourseQueryDto,
    userId?: string,
  ): Promise<PageDto<Course>> {
    const where: any = { isPublished: true };
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.search) where.title = Like(`%${query.search}%`);
    if (query.isPremium !== undefined) where.isPremium = query.isPremium;
    if (query.minPrice !== undefined && query.maxPrice !== undefined) {
      where.price = Between(query.minPrice, query.maxPrice);
    }

    const [courses, itemCount] = await this.courseRepository.findAndCount({
      where,
      relations: ['category', 'instructor'],
      order: { createdAt: query.order },
      skip: query.skip,
      take: query.take,
    });

    await this._mapMetadata(courses, userId);

    const pageMetaDto = new PaginationMetaDto({
      itemCount,
      pageOptionsDto: query,
    });
    return new PageDto(courses, pageMetaDto);
  }

  async getByInstructor(
    instructorId: string,
    query: GetCourseQueryDto,
  ): Promise<PageDto<Course>> {
    const where: any = { instructorId };
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.search) where.title = Like(`%${query.search}%`);
    if (query.isPremium !== undefined) where.isPremium = query.isPremium;
    if (query.minPrice !== undefined && query.maxPrice !== undefined) {
      where.price = Between(query.minPrice, query.maxPrice);
    }

    const [courses, itemCount] = await this.courseRepository.findAndCount({
      where,
      relations: ['category', 'instructor'],
      order: { createdAt: query.order },
      skip: query.skip,
      take: query.take,
    });

    await this._mapMetadata(courses, instructorId);

    const pageMetaDto = new PaginationMetaDto({
      itemCount,
      pageOptionsDto: query,
    });
    return new PageDto(courses, pageMetaDto);
  }

  private async _mapMetadata(courses: Course[], userId?: string) {
    const courseIds = courses.map((c) => c.id);
    if (courseIds.length === 0) return;

    const reviewStats = await this.courseRepository.manager
      .createQueryBuilder('reviews', 'review')
      .select('review.courseId', 'courseId')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.courseId IN (:...courseIds)', { courseIds })
      .groupBy('review.courseId')
      .getRawMany();

    let enrollments: any[] = [];
    if (userId) {
      enrollments = await this.courseRepository.manager
        .createQueryBuilder('enrollments', 'enrollment')
        .where(
          'enrollment.userId = :userId AND enrollment.courseId IN (:...courseIds)',
          {
            userId,
            courseIds,
          },
        )
        .getMany();
    }
    courses.forEach((course) => {
      const rStats = reviewStats.find((s) => s.courseId === course.id);
      course.reviewsCount = rStats ? parseInt(rStats.count) : 0;

      if (userId) {
        const enrollment = enrollments.find((e) => e.courseId === course.id);
        course.progress = enrollment ? enrollment.progress : 0;
      } else {
        course.progress = 0;
      }
    });
  }

  async findOne(id: string, userId?: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['category', 'instructor'],
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    await this._mapMetadata([course], userId);

    return course;
  }

  async getContentHierarchy(id: string) {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['modules', 'modules.lessons'],
      order: {
        modules: {
          order: 'ASC',
          lessons: {
            order: 'ASC',
          },
        },
      },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course.modules;
  }

  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
    instructorId: string,
    isAdmin = false,
  ): Promise<Course> {
    const course = await this.findOne(id);

    if (course.instructorId !== instructorId && !isAdmin) {
      throw new ForbiddenException(
        'You are not authorized to update this course',
      );
    }

    Object.assign(course, updateCourseDto);
    const updatedCourse = await this.courseRepository.save(course);

    this.notificationsGateway.notifyUpdateCourse(updatedCourse);

    return updatedCourse;
  }

  async remove(
    id: string,
    instructorId: string,
    isAdmin = false,
  ): Promise<void> {
    const course = await this.findOne(id);

    if (course.instructorId !== instructorId && !isAdmin) {
      throw new ForbiddenException(
        'You are not authorized to delete this course',
      );
    }

    await this.courseRepository.softRemove(course);

    this.notificationsGateway.notifyDeleteCourse(id);
  }

  async togglePublish(
    id: string,
    instructorId: string,
    isAdmin = false,
  ): Promise<Course> {
    const course = await this.findOne(id);

    if (course.instructorId !== instructorId && !isAdmin) {
      throw new ForbiddenException(
        'You are not authorized to publish this course',
      );
    }

    course.isPublished = !course.isPublished;

    const savedCourse = await this.courseRepository.save(course);

    this.notificationsGateway.notifyNewCourse(savedCourse);

    return savedCourse;
  }

  async updateCourseStats(
    courseId: string,
    averageRating: number,
    reviewsCount: number,
  ): Promise<void> {
    await this.courseRepository.update(courseId, {
      averageRating,
      reviewsCount,
    });
  }
}
