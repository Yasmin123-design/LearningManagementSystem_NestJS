import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from './entities/certificate.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import PDFDocument from 'pdfkit';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) {}

  async generateCertificate(
    enrollmentId: string,
    userId: string,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId, userId },
      relations: ['course', 'student'],
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found or unauthorized');
    }

    if (enrollment.progress < 100) {
      throw new BadRequestException(
        'Course progress must be 100% to generate a certificate',
      );
    }

    let certificate = await this.certificateRepository.findOne({
      where: { enrollmentId },
    });

    if (!certificate) {
      const code = `CERT-${uuidv4().split('-')[0].toUpperCase()}-${Date.now().toString().slice(-4)}`;
      certificate = this.certificateRepository.create({
        userId,
        courseId: enrollment.courseId,
        enrollmentId,
        certificateCode: code,
      });
      await this.certificateRepository.save(certificate);
    }

    const buffer = await this.createPdfBuffer(
      enrollment,
      certificate.certificateCode,
    );
    return {
      buffer,
      filename: `Certificate-${enrollment.course.title.replace(/\s+/g, '-')}.pdf`,
    };
  }

  private async createPdfBuffer(
    enrollment: any,
    code: string,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const width = doc.page.width;
      const height = doc.page.height;

      doc
        .rect(20, 20, width - 40, height - 40)
        .lineWidth(10)
        .stroke('#1a73e8');
      doc
        .rect(30, 30, width - 60, height - 60)
        .lineWidth(2)
        .stroke('#1a73e8');

      doc.moveDown(4);
      doc
        .fillColor('#1a73e8')
        .fontSize(50)
        .text('CERTIFICATE OF COMPLETION', { align: 'center' });

      doc.moveDown(1);
      doc
        .fillColor('#333')
        .fontSize(20)
        .text('This is to certify that', { align: 'center' });

      doc.moveDown(1);
      doc
        .fillColor('#000')
        .fontSize(35)
        .text(enrollment.student.email.split('@')[0].toUpperCase(), {
          align: 'center',
          underline: true,
        });

      doc.moveDown(1);
      doc
        .fillColor('#333')
        .fontSize(20)
        .text('has successfully completed the course:', { align: 'center' });

      doc.moveDown(1);
      doc
        .fillColor('#1a73e8')
        .font('Helvetica-Bold')
        .fontSize(30)
        .text(enrollment.course.title, { align: 'center' });

      doc.moveDown(2);
      doc
        .fillColor('#666')
        .fontSize(14)
        .text(`Issued on: ${new Date().toLocaleDateString()}`, {
          align: 'center',
        });
      doc.text(`Verify Code: ${code}`, { align: 'center' });

      doc.fontSize(10).text('LMS - Online Learning Platform', 20, height - 50, {
        align: 'center',
      });

      doc.end();
    });
  }
}
