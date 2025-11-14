import { Field, ObjectType } from '@nestjs/graphql';
import { UserProfileModel } from '../../profile/models/user-profile.model';

@ObjectType()
export class AuthPayloadModel {
  @Field(() => String)
  accessToken: string;

  @Field(() => UserProfileModel)
  user: UserProfileModel;
}
