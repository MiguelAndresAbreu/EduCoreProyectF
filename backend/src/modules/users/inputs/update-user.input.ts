import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../entities/user.entity';

@InputType()
export class UpdateUserInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  username?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @Field(() => UserRole, { nullable: true })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
