import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { AtGuard } from '../auth/guards/at.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('instructor')
@ApiBearerAuth()
@Controller('instructor')
@UseGuards(AtGuard, RolesGuard)
@Roles(Role.INSTRUCTOR, Role.ADMIN)
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get instructor dashboard statistics' })
  getStats(@CurrentUser('userId') userId: string) {
    return this.instructorService.getStats(userId);
  }

  @Get('courses')
  @ApiOperation({ summary: 'Get all courses created by the instructor' })
  getCourses(@CurrentUser('userId') userId: string) {
    return this.instructorService.getCourses(userId);
  }
}

@ApiTags('instructors')
@Controller('instructors')
export class InstructorPublicController {
  constructor(private readonly instructorService: InstructorService) {}

  @Get(':instructorId')
  @ApiOperation({ summary: 'Get public instructor profile with courses and ratings' })
  getPublicProfile(@Param('instructorId') instructorId: string) {
    return this.instructorService.getPublicProfile(instructorId);
  }
}
