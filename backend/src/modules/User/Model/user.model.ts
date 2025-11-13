import { ObjectType, Field, Int } from '@nestjs/graphql';
import { PersonModel } from '../../Person/Model/person.model';
import { UserRole } from '../Entity/user.entity';


@ObjectType()
export class UserModel {
    @Field(() => Int)
    id: number;

    @Field(() => String)
    username: string;

    @Field(() => Boolean)
    isActive: boolean;

    @Field(() => PersonModel)
    person: PersonModel;

    @Field(() => UserRole)
    role: UserRole;
}

