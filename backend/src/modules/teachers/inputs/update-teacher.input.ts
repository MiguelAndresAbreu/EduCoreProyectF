import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsDateString, IsOptional } from 'class-validator';

@InputType()
export class UpdateTeacherInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  subjects?: string[];
}
