import { ObjectType, Field, Int, InputType } from '@nestjs/graphql';
import { CreatePersonInput, PersonModel } from '../../Person/Model/person.model';
import { UserRole } from '../Entity/user.entity';


@InputType()
export class CreateUserInput {
    @Field(() => String)
    username: string;

    @Field(() => String)
    password: string;

    @Field(() => CreatePersonInput)
    person: CreatePersonInput;

    @Field(() => UserRole)
    role: UserRole;
}