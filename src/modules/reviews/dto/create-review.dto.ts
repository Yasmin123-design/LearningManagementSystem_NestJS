import { IsNotEmpty, IsString, IsNumber, Min, Max, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: 'uuid-of-course' })
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Great course, very helpful!', required: false })
  @IsString()
  @IsOptional()
  comment?: string;
}
