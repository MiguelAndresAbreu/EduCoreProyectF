import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional } from 'class-validator';
import { GradeType } from '../entities/grade.entity';

export class CreateGradeDto {
  @IsInt()
  courseId: number;

  @IsInt()
  studentId: number;

  @IsOptional()
  @IsInt()
  teacherId?: number;

  @IsEnum(GradeType)
  type: GradeType;

  @IsNumber()
  value: number;

  @IsDateString()
  date: string;
}
