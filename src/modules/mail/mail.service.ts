import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  async sendVerificationEmail(email: string, token: string) {
    this.logger.log(`Sending verification email to ${email} with token: ${token}`);
    // Simulate email sending delay
    return true;
  }

  async sendPasswordResetEmail(email: string, token: string) {
    this.logger.log(`Sending password reset email to ${email} with token: ${token}`);
    // Simulate email sending delay
    return true;
  }
}
