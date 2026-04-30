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
import { ConfigService } from '@nestjs/config';
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
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { LinkedInAuthGuard } from './guards/linkedin-auth.guard';
import type { Request, Response } from 'express';
import { Req, Res } from '@nestjs/common';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
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
  @ApiOperation({ summary: 'Verify user email' })
  async verify(@Query('token') token: string, @Res() res: Response) {
    const frontendUrl = this.configService.get<string>('app.frontendUrl');
    try {
      await this.usersService.verifyEmailByToken(token);
      return res.redirect(`${frontendUrl}/verify-status?success=true`);
    } catch (error: any) {
      return res.redirect(
        `${frontendUrl}/verify-status?success=false&message=${encodeURIComponent(error.message)}`,
      );
    }
  }

  @Public()
  @Get('reset-password')
  @ApiOperation({ summary: 'Show reset password form (Redirects to Frontend)' })
  async showResetPasswordForm(
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    const frontendUrl = this.configService.get<string>('app.frontendUrl');
    return res.redirect(`${frontendUrl}/reset-password?token=${token}`);
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
  @ApiOperation({ summary: 'Reset password using token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    try {
      await this.authService.resetPassword(resetPasswordDto);
      return { success: true, message: 'Password reset successful' };
    } catch (error: any) {
      throw error; 
    }
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  @ApiOperation({ summary: 'Login with Google' })
  async googleAuth(@Req() req) {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  @ApiOperation({ summary: 'Google auth callback' })
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const tokens = await this.authService.validateOAuthUser(req.user, 'google');
    console.log(tokens);
    const frontendUrl = this.configService.get<string>('app.frontendUrl');
    return res.redirect(
      `${frontendUrl}/auth-success?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
    );
  }

  @Public()
  @UseGuards(LinkedInAuthGuard)
  @Get('linkedin')
  @ApiOperation({ summary: 'Login with LinkedIn' })
  async linkedinAuth(@Req() req) {}

  @Public()
  @UseGuards(LinkedInAuthGuard)
  @Get('linkedin/callback')
  @ApiOperation({ summary: 'LinkedIn auth callback' })
  async linkedinAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const tokens = await this.authService.validateOAuthUser(
      req.user,
      'linkedin',
    );
    const frontendUrl = this.configService.get<string>('app.frontendUrl');
    return res.redirect(
      `${frontendUrl}/auth-success?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
    );
  }
}
