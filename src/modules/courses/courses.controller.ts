import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { GetCourseQueryDto } from './dto/get-course-query.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { AtGuard } from '../auth/guards/at.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { UseInterceptors } from '@nestjs/common';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @UseGuards(AtGuard, RolesGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new course (Instructor/Admin only)' })
  create(
    @Body() createCourseDto: CreateCourseDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.coursesService.create(createCourseDto, userId);
  }

  @Public()
  @UseInterceptors(CacheInterceptor)
  @Get()
  @ApiOperation({ summary: 'Get all courses (Paginated, Filtered)' })
  findAll(@Query() query: GetCourseQueryDto) {
    return this.coursesService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.findOne(id);
  }

  @Public()
  @Get(':id/content')
  @ApiOperation({ summary: 'Get course content (Modules and Lessons) hierarchy' })
  getContent(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.getContentHierarchy(id);
  }

  @Patch(':id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @UseGuards(AtGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update course (Owner/Admin only)' })
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: string,
  ) {
    const isAdmin = role === Role.ADMIN;
    return this.coursesService.update(id, updateCourseDto, userId, isAdmin);
  }

  @Delete(':id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @UseGuards(AtGuard, RolesGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete course (Owner/Admin only)' })
  remove(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: string,
  ) {
    const isAdmin = role === Role.ADMIN;
    return this.coursesService.remove(id, userId, isAdmin);
  }

  @Patch(':id/publish')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @UseGuards(AtGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle course publish status (Owner/Admin only)' })
  togglePublish(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: string,
  ) {
    const isAdmin = role === Role.ADMIN;
    return this.coursesService.togglePublish(id, userId, isAdmin);
  }
}
