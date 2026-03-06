import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { AtGuard } from '../auth/guards/at.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

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
}
