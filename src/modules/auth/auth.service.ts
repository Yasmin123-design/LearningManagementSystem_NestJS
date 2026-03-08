import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    console.log(user);
    await this.mailService.sendVerificationEmail(
      user.email,
      user.verificationToken || '',
    );

    return {
      message: 'Registration successful. Please verify your email.',
      userId: user.id,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new BadRequestException(
        'Please verify your email before logging in',
      );
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    const token = uuidv4();
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    await this.usersService.updateResetPasswordToken(
      user.email,
      token,
      expires,
    );
    await this.mailService.sendPasswordResetEmail(user.email, token);

    return { message: 'Password reset email sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersService.findByResetToken(
      resetPasswordDto.token,
    );

    if (
      !user ||
      !user.resetPasswordToken ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    await this.usersService.updatePassword(user.id, {
      password: hashedPassword,
    });
    await this.usersService.clearResetPasswordToken(user.id);

    return { message: 'Password reset successful' };
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
  }

  async refreshTokens(userId: string, refreshToken: string) {
    console.log(`[Refresh] Attempting refresh for userId: ${userId}`);
    const user = await this.usersService.findById(userId);
    
    if (!user) {
      console.log(`[Refresh] User not found: ${userId}`);
      throw new UnauthorizedException('Access Denied');
    }

    if (!user.refreshToken) {
      console.log(`[Refresh] No refresh token in DB for user: ${userId}`);
      throw new UnauthorizedException('Access Denied');
    }

    console.log(`[Refresh] Provided token (start): ${refreshToken.substring(0, 10)}...`);
    
    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    
    if (!refreshTokenMatches) {
      console.log(`[Refresh] Token mismatch for user: ${userId}`);
      throw new UnauthorizedException('Access Denied');
    }

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  private async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ) {
    const hashedRefreshToken = refreshToken
      ? await bcrypt.hash(refreshToken, 10)
      : null;
    await this.usersService.updateRefreshToken(userId, hashedRefreshToken);
  }

  private async getTokens(userId: string, email: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: this.configService.get<string>('app.jwt.accessSecret'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: this.configService.get<string>('app.jwt.refreshSecret'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
