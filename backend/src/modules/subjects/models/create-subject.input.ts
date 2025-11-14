import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateSubjectInput {
  @Field()
  name: string;

  @Field()
  code: string;

  @Field({ nullable: true })
  description?: string;
}
