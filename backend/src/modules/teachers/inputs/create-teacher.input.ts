import { Field, InputType, Int } from '@nestjs/graphql';
import { IsArray, IsDateString, IsNumber, IsOptional } from 'class-validator';

@InputType()
export class CreateTeacherInput {
  @Field(() => Int)
  @IsNumber()
  userId: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  subjects?: string[];
}
