import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Teacher } from '../entities/teacher.entity';
import { PersonModel } from '../../person/models/person.model';

@ObjectType()
export class TeacherModel {
  @Field(() => ID)
  id: number;

  @Field(() => PersonModel)
  person: PersonModel;

  @Field(() => String, { nullable: true })
  hireDate?: string | null;

  @Field(() => [String], { nullable: true })
  subjects?: string[] | null;

  static fromEntity(entity: Teacher | null | undefined): TeacherModel | null {
    if (!entity) {
      return null;
    }
    const person = PersonModel.fromEntity(entity.person);
    if (!person) {
      return null;
    }
    const model = new TeacherModel();
    model.id = entity.id;
    model.person = person;
    model.hireDate = entity.hireDate ?? null;
    model.subjects = entity.subjects ?? null;
    return model;
  }
}
