import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class LoginInput {
  @Field(() => String)
  @IsString()
  identifier: string;

  @Field(() => String)
  @IsString()
  password: string;
}
