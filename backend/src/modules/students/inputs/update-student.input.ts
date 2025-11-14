import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateStudentInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  gradeLevel?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  status?: string;
}
