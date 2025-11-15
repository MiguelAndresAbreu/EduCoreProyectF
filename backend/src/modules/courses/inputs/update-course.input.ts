import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateCourseInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  subjectId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  teacherId?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  schedule?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  capacity?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  room?: string;
}

