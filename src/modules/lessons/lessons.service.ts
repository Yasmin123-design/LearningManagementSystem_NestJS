import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './entities/lesson.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ModulesService } from '../modules/modules.service';
import { CoursesService } from '../courses/courses.service';
import { Role } from '../../common/decorators/roles.decorator';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    private readonly modulesService: ModulesService,
    private readonly coursesService: CoursesService,
  ) {}

  async create(createLessonDto: CreateLessonDto, userId: string, role: string) {
    const module = await this.modulesService.findOne(createLessonDto.moduleId);
    const course = await this.coursesService.findOne(module.courseId);

    if (course.instructorId !== userId && role !== Role.ADMIN) {
      throw new ForbiddenException('Only the instructor of this course or an admin can add lessons');
    }

    const lesson = this.lessonRepository.create(createLessonDto);
    return this.lessonRepository.save(lesson);
  }

  async findOne(id: string) {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson;
  }

  async findAllByModule(moduleId: string) {
    return this.lessonRepository.find({
      where: { moduleId },
      order: { order: 'ASC' },
    });
  }

  async update(id: string, updateLessonDto: UpdateLessonDto, userId: string, role: string) {
    const lesson = await this.findOne(id);
    const module = await this.modulesService.findOne(lesson.moduleId);
    const course = await this.coursesService.findOne(module.courseId);

    if (course.instructorId !== userId && role !== Role.ADMIN) {
      throw new ForbiddenException('Only the instructor of this course or an admin can update lessons');
    }

    Object.assign(lesson, updateLessonDto);
    return this.lessonRepository.save(lesson);
  }

  async remove(id: string, userId: string, role: string) {
    const lesson = await this.findOne(id);
    const module = await this.modulesService.findOne(lesson.moduleId);
    const course = await this.coursesService.findOne(module.courseId);

    if (course.instructorId !== userId && role !== Role.ADMIN) {
      throw new ForbiddenException('Only the instructor of this course or an admin can delete lessons');
    }

    return this.lessonRepository.remove(lesson);
  }
}
