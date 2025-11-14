import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateStudentInput {
  @Field(() => Int)
  userId: number;

  @Field({ nullable: true })
  gradeLevel?: string;

  @Field({ nullable: true })
  status?: string;
}
