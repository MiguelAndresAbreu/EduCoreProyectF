import { IsDateString, IsInt, IsNumber, IsString } from 'class-validator';

export class CreateGradeDto {
  @IsInt()
  courseId: number;

  @IsInt()
  studentId: number;

  @IsString()
  type: string;

  @IsNumber()
  score: number;

  @IsNumber()
  maxScore: number;

  @IsDateString()
  date: string;
}
