import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Person } from '../entities/person.entity';

@ObjectType()
export class PersonModel {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  firstName: string;

  @Field(() => String)
  lastName: string;

  @Field(() => String)
  email: string;

  @Field(() => String, { nullable: true })
  phone?: string | null;

  @Field(() => String, { nullable: true })
  address?: string | null;

  @Field(() => String, { nullable: true })
  birthDate?: string | null;

  @Field(() => String, { nullable: true })
  avatar?: string | null;

  static fromEntity(entity: Person | null | undefined): PersonModel | null {
    if (!entity) {
      return null;
    }
    const model = new PersonModel();
    model.id = entity.id;
    model.firstName = entity.firstName;
    model.lastName = entity.lastName;
    model.email = entity.email;
    model.phone = entity.phone ?? null;
    model.address = entity.address ?? null;
    model.birthDate = entity.birthDate ?? null;
    model.avatar = entity.avatar ?? null;
    return model;
  }
}
