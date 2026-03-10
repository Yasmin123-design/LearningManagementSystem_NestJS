import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateOptionDto {
  @IsString()
  @IsOptional()
  text?: string;

  @IsBoolean()
  @IsOptional()
  isCorrect?: boolean;
}
