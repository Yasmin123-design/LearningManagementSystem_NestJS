import { IsNotEmpty, IsString, IsOptional, IsInt, IsUUID, IsEnum, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LessonType } from '../entities/lesson.entity';

export class CreateLessonDto {
  @ApiProperty({ example: 'Setting up the project' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'In this lesson we will...', required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ example: 'https://youtube.com/...', required: false })
  @IsUrl()
  @IsOptional()
  videoUrl?: string;

  @ApiProperty({ enum: LessonType, default: LessonType.VIDEO })
  @IsEnum(LessonType)
  @IsOptional()
  type?: LessonType;

  @ApiProperty({ example: 0, default: 0 })
  @IsInt()
  @IsOptional()
  order?: number;

  @ApiProperty({ example: 'uuid-of-module' })
  @IsUUID()
  @IsNotEmpty()
  moduleId: string;
}
