import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    private readonly mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleStudentReminders() {
    this.logger.log('Starting student reminders cron job...');

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const fourDaysAgo = new Date();
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

    const inactiveEnrollments = await this.enrollmentRepository.find({
      where: {
        progress: 0,
        enrolledAt: LessThanOrEqual(threeDaysAgo),
      },
      relations: ['student', 'course'],
    });

    this.logger.log(
      `Found ${inactiveEnrollments.length} inactive enrollments.`,
    );

    for (const enrollment of inactiveEnrollments) {
      if (enrollment.student && enrollment.course) {
        this.logger.log(
          `Sending reminder to ${enrollment.student.email} for course ${enrollment.course.title}`,
        );

        await this.mailService.sendReminderEmail(
          enrollment.student.email,
          enrollment.student.name || enrollment.student.email,
          enrollment.course.title,
          enrollment.courseId,
        );
      }
    }

    this.logger.log('Student reminders cron job completed.');
  }
}
