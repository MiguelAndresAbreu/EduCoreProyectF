import { IsArray, IsDateString, IsOptional } from 'class-validator';

export class UpdateTeacherDto {
  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @IsOptional()
  @IsArray()
  subjects?: string[];
}
