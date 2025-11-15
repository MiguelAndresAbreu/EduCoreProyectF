import { Field, InputType } from '@nestjs/graphql';
import {UpdatePersonInput} from "@/modules/person/inputs/update-person.input";
import {UpdateUserInput} from "@/modules/users/inputs/update-user.input";

@InputType()
export class UpdateProfileInput {
  @Field(() => UpdatePersonInput)
  person: UpdatePersonInput;

  @Field(() => UpdateUserInput, { nullable: true })
  user?: UpdateUserInput;
}
