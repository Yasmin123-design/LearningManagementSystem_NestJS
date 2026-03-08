import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { AtGuard } from '../auth/guards/at.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('me')
  @Roles(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN)
  @UseGuards(AtGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all my reviews' })
  getMyReviews(@CurrentUser('userId') userId: string) {
    return this.reviewsService.findMyReviews(userId);
  }

  @Post()
  @Roles(Role.STUDENT)
  @UseGuards(AtGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a review for a course (Enrolled students only)',
  })
  create(
    @CurrentUser('userId') userId: string,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewsService.create(userId, createReviewDto);
  }

  @Public()
  @Get(':courseId')
  @ApiOperation({ summary: 'Get all reviews for a course' })
  findByCourse(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.reviewsService.findByCourse(courseId);
  }

  @Patch(':id')
  @Roles(Role.STUDENT, Role.ADMIN)
  @UseGuards(AtGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a review (Owner/Admin only)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    const isAdmin = role === Role.ADMIN;
    return this.reviewsService.update(id, userId, updateReviewDto, isAdmin);
  }

  @Delete(':id')
  @Roles(Role.STUDENT, Role.ADMIN)
  @UseGuards(AtGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a review (Owner/Admin only)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: string,
  ) {
    const isAdmin = role === Role.ADMIN;
    return this.reviewsService.remove(id, userId, isAdmin);
  }
}
