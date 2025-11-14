import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateStudentInput {
  @Field(() => Int)
  @IsNumber()
  userId: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  gradeLevel?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  status?: string;
}
