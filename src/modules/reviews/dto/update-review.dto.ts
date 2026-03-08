import { IsNumber, Min, Max, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReviewDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5, required: false })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @ApiProperty({ example: 'Updated review comment', required: false })
  @IsString()
  @IsOptional()
  comment?: string;
}
