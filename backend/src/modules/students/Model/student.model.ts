import { ObjectType, Field, Int } from '@nestjs/graphql';
import { UserModel } from '../../User/Model/user.model';

@ObjectType()
export class StudentModel {
    @Field(() => Int)
    id: number;

    @Field(() => String)
    enrollmentNumber: string;

    @Field(() => String, { nullable: true })
    gradeLevel?: string;

    @Field(() => String, { nullable: true })
    section?: string;

    @Field(() => UserModel)
    user: UserModel;
}
