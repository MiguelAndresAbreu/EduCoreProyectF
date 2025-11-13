import { ObjectType, Field, Int, InputType } from '@nestjs/graphql';

@ObjectType()
export class PersonModel {
    @Field(() => Int)
    id: number;

    @Field(() => String)
    firstName: string;

    @Field(() => String)
    lastName: string;

    @Field(() => String)
    email: string;

    @Field(() => String, { nullable: true })
    phone?: string;

    @Field(() => String, { nullable: true })
    address?: string;
}

@InputType()
export class CreatePersonInput {
    @Field(() => String)
    firstName: string;

    @Field(() => String)
    lastName: string;

    @Field(() => String)
    email: string;

    @Field(() => String, { nullable: true })
    phone?: string;

    @Field(() => String, { nullable: true })
    address?: string;
}
