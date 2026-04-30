import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { ConfigService } from '@nestjs/config';
import { CoursesService } from '../courses/courses.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private stripe: Stripe;

  constructor(
    private readonly enrollmentsService: EnrollmentsService,
    private readonly configService: ConfigService,
    private readonly coursesService: CoursesService,
  ) {
    this.stripe = new Stripe(
      this.configService.get('STRIPE_SECRET_KEY') || '',
      {
        apiVersion: '2026-02-25.clover',
      },
    );
  }

  async processPayment(userId: string, processPaymentDto: ProcessPaymentDto) {
    const { courseId, successUrl } = processPaymentDto;

    const course = await this.coursesService.findOne(courseId);
    if (!course) {
      throw new BadRequestException('Course not found');
    }

    this.logger.log(
      `Creating Checkout Session for user ${userId} and course ${courseId} with price ${course.price}`,
    );

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: course.title,
                description: `Course ID: ${courseId}`,
              },
              unit_amount: Math.round(Number(course.price) * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: `${this.configService.get<string>('app.frontendUrl') || 'http://localhost:3001'}/payment/cancel`,
        metadata: {
          userId,
          courseId,
        },
      });

      return { url: session.url };
    } catch (error) {
      this.logger.error(`Stripe session error: ${error.message}`);
      throw new BadRequestException(
        `Failed to create checkout session: ${error.message}`,
      );
    }
  }

  async handleWebhook(body: any, signature: string) {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    this.logger.log(`Webhook secret present: ${!!webhookSecret}`);
    if (webhookSecret) {
      this.logger.log(
        `Webhook secret starts with: ${webhookSecret.substring(0, 7)}...`,
      );
    }
    this.logger.log(`Body type: ${typeof body}`);
    this.logger.log(`Is Buffer: ${Buffer.isBuffer(body)}`);
    if (Buffer.isBuffer(body)) {
      this.logger.log(`Body length: ${body.length}`);
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret || '',
      );
    } catch (err) {
      this.logger.error(
        `Webhook signature verification failed: ${err.message}`,
      );
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;

      if (!metadata || !metadata.userId || !metadata.courseId) {
        this.logger.error('Webhook session metadata is missing');
        return { received: false };
      }

      const { userId, courseId } = metadata;

      this.logger.log(
        `Payment confirmed for user ${userId} and course ${courseId}`,
      );
      console.log('hhhhhhhhhhhhhhhhhhhhhhhh');
      await this.enrollmentsService.markAsPaid(userId, courseId);
    }

    return { received: true };
  }
}
