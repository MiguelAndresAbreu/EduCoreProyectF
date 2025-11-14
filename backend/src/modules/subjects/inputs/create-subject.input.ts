import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateSubjectInput {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => String)
  @IsString()
  code: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}
