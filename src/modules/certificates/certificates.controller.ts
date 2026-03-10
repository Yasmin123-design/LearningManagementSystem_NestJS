import { Controller, Post, Param, UseGuards, Res } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { AtGuard } from '../auth/guards/at.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';

@ApiTags('certificates')
@ApiBearerAuth()
@Controller()
@UseGuards(AtGuard)
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post('enrollments/:enrollmentId/generate-certificate')
  @ApiOperation({ summary: 'Generate and download course completion certificate' })
  async generate(
    @Param('enrollmentId') enrollmentId: string,
    @CurrentUser('userId') userId: string,
    @Res() res: Response,
  ) {
    const { buffer, filename } = await this.certificatesService.generateCertificate(enrollmentId, userId);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${filename}`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
