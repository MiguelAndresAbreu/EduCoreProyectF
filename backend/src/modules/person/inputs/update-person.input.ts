import { Field, InputType } from '@nestjs/graphql';
import { IsDateString, IsEmail, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdatePersonInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  firstName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  avatar?: string;
}
