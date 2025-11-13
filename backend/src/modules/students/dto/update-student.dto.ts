import { IsOptional, IsString } from 'class-validator';

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  gradeLevel?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
