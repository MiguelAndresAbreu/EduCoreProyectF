import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateStudentInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  gradeLevel?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;
}
