import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Web Development' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 'Short description of the category', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;
}
