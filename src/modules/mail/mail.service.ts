import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly frontendUrl: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl =
      this.configService.get<string>('app.frontendUrl') ||
      'http://localhost:3000';
  }

  async sendVerificationEmail(email: string, token: string) {
    this.logger.log(`Sending verification email to ${email}`);
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Welcome to LMS - Verify your Email',
        template: './verification',
        context: {
          token,
          email,
          frontendUrl: this.frontendUrl,
        },
      });
      return true;
    } catch (error) {
      this.logger.error(
        `Error sending verification email to ${email}: ${error.stack}`,
      );
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, token: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'LMS - Password Reset Request',
        template: './password-reset',
        context: {
          token,
          email,
          frontendUrl: this.frontendUrl,
        },
      });
      return true;
    } catch (error) {
      this.logger.error(
        `Error sending password reset email to ${email}: ${error.message}`,
      );
      return false;
    }
  }
}
