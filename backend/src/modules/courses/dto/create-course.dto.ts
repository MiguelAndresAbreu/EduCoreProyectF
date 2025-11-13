import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  subjectId: number;

  @IsInt()
  teacherId: number;

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
