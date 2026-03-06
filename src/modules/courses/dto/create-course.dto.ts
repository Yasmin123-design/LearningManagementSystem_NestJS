import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ example: 'Complete NestJS Bootcamp' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Learn NestJS from scratch with this comprehensive course.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '99.99', required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isPremium?: boolean;

  @ApiProperty({ example: 'uuid-of-category' })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ example: 'https://example.com/thumbnail.jpg', required: false })
  @IsString()
  @IsOptional()
  thumbnail?: string;
}
