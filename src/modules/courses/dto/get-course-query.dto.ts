import { IsOptional, IsString, IsBoolean, IsUUID, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PageOptionsDto } from '../../../common/dtos/page.dto';
import { Type } from 'class-transformer';

export class GetCourseQueryDto extends PageOptionsDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isPremium?: boolean;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  minPrice?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  maxPrice?: number;
}
