import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Student } from '../entities/student.entity';
import { PersonModel } from '../../person/models/person.model';

@ObjectType()
export class StudentModel {
  @Field(() => ID)
  id: number;

  @Field(() => PersonModel)
  person: PersonModel;

  @Field(() => Date)
  enrollmentDate: Date;

  @Field()
  status: string;

  @Field({ nullable: true })
  gradeLevel?: string | null;

  static fromEntity(entity: Student | null | undefined): StudentModel | null {
    if (!entity) {
      return null;
    }
    const person = PersonModel.fromEntity(entity.person);
    if (!person) {
      return null;
    }
    const model = new StudentModel();
    model.id = entity.id;
    model.person = person;
    model.enrollmentDate = entity.enrollmentDate;
    model.status = entity.status;
    model.gradeLevel = entity.gradeLevel ?? null;
    return model;
  }
}
