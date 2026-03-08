import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Module } from './entities/module.entity';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { CoursesService } from '../courses/courses.service';
import { Role } from '../../common/decorators/roles.decorator';

@Injectable()
export class ModulesService {
  constructor(
    @InjectRepository(Module)
    private readonly moduleRepository: Repository<Module>,
    private readonly coursesService: CoursesService,
  ) {}

  async create(createModuleDto: CreateModuleDto, userId: string, role: string) {
    const course = await this.coursesService.findOne(createModuleDto.courseId);
    
    if (course.instructorId !== userId && role !== Role.ADMIN) {
      throw new ForbiddenException('Only the instructor of this course or an admin can add modules');
    }

    const module = this.moduleRepository.create(createModuleDto);
    return this.moduleRepository.save(module);
  }

  async findAllByCourse(courseId: string) {
    return this.moduleRepository.find({
      where: { courseId },
      order: { order: 'ASC' },
      relations: ['lessons'],
    });
  }

  async findOne(id: string) {
    const module = await this.moduleRepository.findOne({
      where: { id },
      relations: ['lessons'],
    });
    if (!module) throw new NotFoundException('Module not found');
    return module;
  }

  async update(id: string, updateModuleDto: UpdateModuleDto, userId: string, role: string) {
    const module = await this.findOne(id);
    const course = await this.coursesService.findOne(module.courseId);

    if (course.instructorId !== userId && role !== Role.ADMIN) {
      throw new ForbiddenException('Only the instructor of this course or an admin can update modules');
    }

    Object.assign(module, updateModuleDto);
    return this.moduleRepository.save(module);
  }

  async remove(id: string, userId: string, role: string) {
    const module = await this.findOne(id);
    const course = await this.coursesService.findOne(module.courseId);

    if (course.instructorId !== userId && role !== Role.ADMIN) {
      throw new ForbiddenException('Only the instructor of this course or an admin can delete modules');
    }

    return this.moduleRepository.remove(module);
  }
}
