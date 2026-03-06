import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { AtGuard } from '../auth/guards/at.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @Roles(Role.STUDENT)
  @UseGuards(AtGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a review for a course (Enrolled students only)' })
  create(
    @CurrentUser('userId') userId: string,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewsService.create(userId, createReviewDto);
  }

  @Public()
  @Get(':courseId')
  @ApiOperation({ summary: 'Get all reviews for a course' })
  findByCourse(@Param('courseId') courseId: string) {
    return this.reviewsService.findByCourse(courseId);
  }
}
