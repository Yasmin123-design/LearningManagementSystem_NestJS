import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateQuestionDto {
  @IsString()
  @IsOptional()
  text?: string;

  @IsInt()
  @IsOptional()
  points?: number;
}
