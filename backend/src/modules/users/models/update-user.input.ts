import { Field, InputType } from '@nestjs/graphql';
import { UserRole } from '../entities/user.entity';

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  password?: string;

  @Field(() => UserRole, { nullable: true })
  role?: UserRole;

  @Field({ nullable: true })
  isActive?: boolean;
}
