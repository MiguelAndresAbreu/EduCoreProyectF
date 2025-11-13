import { IsArray, IsDateString, IsNumber, IsOptional } from 'class-validator';

export class CreateTeacherDto {
  @IsNumber()
  userId: number;

  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @IsOptional()
  @IsArray()
  subjects?: string[];
}
