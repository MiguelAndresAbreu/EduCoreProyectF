import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateEnrollmentDto {
  @IsInt()
  studentId: number;

  @IsInt()
  courseId: number;

  @IsOptional()
  @IsString()
  status?: string;
}
