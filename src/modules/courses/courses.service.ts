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
import { PageDto, PaginationMetaDto } from 'src/common/dtos/page.dto';
@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(
    createCourseDto: CreateCourseDto,
    instructorId: string,
  ): Promise<Course> {
    const course = this.courseRepository.create({
      ...createCourseDto,
      instructorId,
    });
    return this.courseRepository.save(course);
  }

  async findAll(query: GetCourseQueryDto): Promise<PageDto<Course>> {
    const where: FindOptionsWhere<Course> = { isPublished: true };

    if (query.search) {
      where.title = Like(`%${query.search}%`);
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.isPremium !== undefined) {
      where.isPremium = query.isPremium;
    }

    if (query.minPrice !== undefined && query.maxPrice !== undefined) {
      where.price = Between(query.minPrice, query.maxPrice);
    }

    const [entities, itemCount] = await this.courseRepository.findAndCount({
      where,
      order: { createdAt: query.order },
      skip: query.skip,
      take: query.take,
      relations: ['category', 'instructor'],
    });

    const pageMetaDto = new PaginationMetaDto({
      itemCount,
      pageOptionsDto: query,
    });
    return new PageDto(entities, pageMetaDto);
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['category', 'instructor'],
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return course;
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
    return this.courseRepository.save(course);
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
    return this.courseRepository.save(course);
  }

  async updateAverageRating(
    courseId: string,
    averageRating: number,
  ): Promise<void> {
    await this.courseRepository.update(courseId, { averageRating });
  }
}
