import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateStudentInput {
  @Field({ nullable: true })
  gradeLevel?: string;

  @Field({ nullable: true })
  status?: string;
}
