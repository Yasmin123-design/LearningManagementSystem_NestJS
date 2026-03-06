import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  async processPayment(userId: string, processPaymentDto: ProcessPaymentDto) {
    const { courseId, paymentToken } = processPaymentDto;

    this.logger.log(`Processing payment for user ${userId} and course ${courseId} with token ${paymentToken}`);

    // Simulation of payment processing logic
    // In a real app, you would integrate with Stripe, PayPal, etc.
    const isSuccess = true;

    if (!isSuccess) {
      throw new BadRequestException('Payment failed');
    }

    await this.enrollmentsService.markAsPaid(userId, courseId);

    return {
      message: 'Payment processed successfully',
      transactionId: `sim_${Math.random().toString(36).substr(2, 9)}`,
    };
  }
}
