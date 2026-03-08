import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Headers,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { AtGuard } from '../auth/guards/at.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Request } from 'express';

interface RequestWithRawBody extends Request {
  rawBody: Buffer;
}

@ApiTags('Payments')
@Controller('payments')
@UseGuards(AtGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles(Role.STUDENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process payment for a premium course' })
  processPayment(
    @CurrentUser('userId') userId: string,
    @Body() processPaymentDto: ProcessPaymentDto,
  ) {
    return this.paymentsService.processPayment(userId, processPaymentDto);
  }

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe Webhook' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: any,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }
    return this.paymentsService.handleWebhook(request.rawBody, signature);
  }
}
