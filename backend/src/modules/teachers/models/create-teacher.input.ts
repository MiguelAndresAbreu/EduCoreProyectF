import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateTeacherInput {
  @Field(() => Int)
  userId: number;

  @Field({ nullable: true })
  hireDate?: string;

  @Field(() => [String], { nullable: true })
  subjects?: string[];
}
