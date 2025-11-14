import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateCourseInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => Int)
  @IsInt()
  subjectId: number;

  @Field(() => Int)
  @IsInt()
  teacherId: number;

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
