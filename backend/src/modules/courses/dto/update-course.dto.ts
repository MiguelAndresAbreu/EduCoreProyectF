import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  subjectId?: number;

  @IsOptional()
  @IsInt()
  teacherId?: number;

  @IsOptional()
  @IsString()
  schedule?: string;

  @IsOptional()
  @IsInt()
  capacity?: number;

  @IsOptional()
  @IsString()
  room?: string;
}
