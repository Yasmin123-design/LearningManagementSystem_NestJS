import { IsNotEmpty, IsUUID, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProcessPaymentDto {
  @ApiProperty({ example: 'uuid-of-course' })
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ example: 'card_token_123' })
  @IsString()
  @IsNotEmpty()
  paymentToken: string;
}
