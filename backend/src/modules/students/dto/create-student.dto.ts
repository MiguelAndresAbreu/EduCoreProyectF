import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateStudentDto {
  @IsNumber()
  userId: number;

  @IsOptional()
  @IsString()
  gradeLevel?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
