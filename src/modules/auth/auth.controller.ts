import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  Render,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AtGuard } from './guards/at.guard';
import { RtGuard } from './guards/rt.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60 } })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  logout(@CurrentUser('userId') userId: string) {
    return this.authService.logout(userId);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  refresh(
    @CurrentUser('userId') userId: string,
    @CurrentUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @Public()
  @Get('verify')
  @Render('verify-result')
  @ApiOperation({ summary: 'Verify user email' })
  async verify(@Query('token') token: string) {
    try {
      await this.usersService.verifyEmailByToken(token);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Public()
  @Get('reset-password')
  @Render('reset-password-form')
  @ApiOperation({ summary: 'Show reset password form' })
  async showResetPasswordForm(@Query('token') token: string) {
    return { token };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  @Render('reset-password-result')
  @ApiOperation({ summary: 'Reset password using token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    try {
      await this.authService.resetPassword(resetPasswordDto);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
