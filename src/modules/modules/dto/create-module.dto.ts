import { IsNotEmpty, IsString, IsOptional, IsInt, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateModuleDto {
  @ApiProperty({ example: 'Introduction to NestJS' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Basic concepts and setup', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 0, default: 0 })
  @IsInt()
  @IsOptional()
  order?: number;

  @ApiProperty({ example: 'uuid-of-course' })
  @IsUUID()
  @IsNotEmpty()
  courseId: string;
}
