import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Course } from '../courses/entities/course.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async addToWishlist(userId: string, courseId: string) {
    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const existing = await this.wishlistRepository.findOne({
      where: { userId, courseId },
    });

    if (existing) {
      throw new ConflictException('Course already in wishlist');
    }

    const wishlistItem = this.wishlistRepository.create({
      userId,
      courseId,
    });

    return this.wishlistRepository.save(wishlistItem);
  }

  async getWishlist(userId: string) {
    return this.wishlistRepository.find({
      where: { userId },
      relations: ['course', 'course.category'],
      order: { createdAt: 'DESC' },
    });
  }

  async removeFromWishlist(userId: string, courseId: string) {
    const result = await this.wishlistRepository.delete({ userId, courseId });
    if (result.affected === 0) {
      throw new NotFoundException('Course not found in wishlist');
    }
    return { message: 'Removed from wishlist' };
  }
}
