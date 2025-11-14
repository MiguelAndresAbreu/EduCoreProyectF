import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateEnrollmentInput {
  @Field(() => Int)
  @IsInt()
  studentId: number;

  @Field(() => Int)
  @IsInt()
  courseId: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  status?: string;
}
