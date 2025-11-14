import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdatePersonInput {
  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  birthDate?: string;

  @Field({ nullable: true })
  avatar?: string;
}
