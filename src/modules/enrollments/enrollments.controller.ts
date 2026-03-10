import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { AtGuard } from '../auth/guards/at.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Enrollments')
@Controller('enrollments')
@UseGuards(AtGuard, RolesGuard)
@ApiBearerAuth()
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Enroll in a course' })
  enroll(
    @CurrentUser('userId') userId: string,
    @Body() createEnrollmentDto: CreateEnrollmentDto,
  ) {
    return this.enrollmentsService.enroll(userId, createEnrollmentDto);
  }

  @Get('me')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get my enrolled courses' })
  getMyEnrollments(@CurrentUser('userId') userId: string) {
    return this.enrollmentsService.getMyEnrollments(userId);
  }

  @Patch(':courseId/progress')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Update course progress percentage' })
  updateProgress(
    @CurrentUser('userId') userId: string,
    @Param('courseId') courseId: string,
    @Body('progress', ParseIntPipe) progress: number,
  ) {
    return this.enrollmentsService.updateProgress(userId, courseId, progress);
  }

  @Post('lessons/:lessonId/complete')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Mark a lesson as completed manually (for non-quiz lessons)' })
  completeLesson(
    @CurrentUser('userId') userId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return this.enrollmentsService.completeLesson(userId, lessonId);
  }
}
