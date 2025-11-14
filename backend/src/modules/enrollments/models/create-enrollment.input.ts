import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateEnrollmentInput {
  @Field(() => Int)
  studentId: number;

  @Field(() => Int)
  courseId: number;

  @Field({ nullable: true })
  status?: string;
}
