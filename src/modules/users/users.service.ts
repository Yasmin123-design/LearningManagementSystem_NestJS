import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';

import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = this.userRepository.create({
      ...registerDto,
      verificationToken: uuidv4(),
    });
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role', 'isVerified'],
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    console.log(user);
    return user;
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.userRepository.update(userId, { refreshToken });
  }

  async verifyEmailByToken(token: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new NotFoundException('Invalid or expired verification token');
    }

    await this.userRepository.update(user.id, {
      isVerified: true,
      verificationToken: null,
    });
  }

  async updateResetPasswordToken(
    email: string,
    token: string,
    expires: Date,
  ): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }
    await this.userRepository.update(user.id, {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { resetPasswordToken: token },
      select: ['id', 'resetPasswordToken', 'resetPasswordExpires'],
    });
  }

  async updatePassword(
    userId: string,
    data: { password: string },
  ): Promise<void> {
    await this.userRepository.update(userId, data);
  }

  async clearResetPasswordToken(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });
  }
}
