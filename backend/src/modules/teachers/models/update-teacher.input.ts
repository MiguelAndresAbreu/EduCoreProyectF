import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateTeacherInput {
  @Field({ nullable: true })
  hireDate?: string;

  @Field(() => [String], { nullable: true })
  subjects?: string[];
}
