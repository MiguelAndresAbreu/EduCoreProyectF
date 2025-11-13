import { PartialType } from '@nestjs/mapped-types';
import { CreateGradeDto } from './create-grade.dto';
import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional } from 'class-validator';
import { GradeType } from '../entities/grade.entity';

export class UpdateGradeDto extends PartialType(CreateGradeDto) {
  @IsOptional()
  @IsInt()
  courseId?: number;

  @IsOptional()
  @IsInt()
  studentId?: number;

  @IsOptional()
  @IsInt()
  teacherId?: number;

  @IsOptional()
  @IsEnum(GradeType)
  type?: GradeType;

  @IsOptional()
  @IsNumber()
  value?: number;

  @IsOptional()
  @IsDateString()
  date?: string;
}
