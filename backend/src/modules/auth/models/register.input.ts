import { Field, InputType } from '@nestjs/graphql';
import { UserRole } from '../../users/entities/user.entity';

@InputType()
export class RegisterInput {
  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field(() => UserRole, { nullable: true })
  role?: UserRole;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  birthDate?: string;

  @Field({ nullable: true })
  avatar?: string;
}
