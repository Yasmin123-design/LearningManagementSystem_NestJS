import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { AtGuard } from '../auth/guards/at.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Course Lessons')
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @UseGuards(AtGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new lesson in a module' })
  create(
    @Body() createLessonDto: CreateLessonDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.lessonsService.create(createLessonDto, userId, role);
  }

  @Public()
  @Get('module/:moduleId')
  @ApiOperation({ summary: 'Get all lessons for a module' })
  findAllByModule(@Param('moduleId', ParseUUIDPipe) moduleId: string) {
    return this.lessonsService.findAllByModule(moduleId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get lesson by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.lessonsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @UseGuards(AtGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update lesson' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.lessonsService.update(id, updateLessonDto, userId, role);
  }

  @Delete(':id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @UseGuards(AtGuard, RolesGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete lesson' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.lessonsService.remove(id, userId, role);
  }
}
