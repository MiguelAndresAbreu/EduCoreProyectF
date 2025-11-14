import { Field, Float, InputType, Int } from '@nestjs/graphql';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { GradeType } from '../entities/grade.entity';

@InputType()
export class CreateGradeInput {
  @Field(() => Int)
  @IsInt()
  courseId: number;

  @Field(() => Int)
  @IsInt()
  studentId: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  teacherId?: number;

  @Field(() => GradeType)
  @IsEnum(GradeType)
  type: GradeType;

  @Field(() => Float)
  @IsNumber()
  value: number;

  @Field(() => String)
  @IsDateString()
  date: string;
}

@InputType()
export class UpdateGradeInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  courseId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  studentId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  teacherId?: number;

  @Field(() => GradeType, { nullable: true })
  @IsOptional()
  @IsEnum(GradeType)
  type?: GradeType;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  value?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsDateString()
  date?: string;
}
