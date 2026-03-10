import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { AtGuard } from '../auth/guards/at.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('wishlist')
@ApiBearerAuth()
@Controller('wishlist')
@UseGuards(AtGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post(':courseId')
  @ApiOperation({ summary: 'Add course to wishlist' })
  addToWishlist(
    @CurrentUser('userId') userId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.wishlistService.addToWishlist(userId, courseId);
  }

  @Get()
  @ApiOperation({ summary: 'Get user wishlist' })
  getWishlist(@CurrentUser('userId') userId: string) {
    return this.wishlistService.getWishlist(userId);
  }

  @Delete(':courseId')
  @ApiOperation({ summary: 'Remove course from wishlist' })
  removeFromWishlist(
    @CurrentUser('userId') userId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.wishlistService.removeFromWishlist(userId, courseId);
  }
}
