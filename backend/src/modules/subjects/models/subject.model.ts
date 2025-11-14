import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Subject } from '../entities/subject.entity';

@ObjectType()
export class SubjectModel {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  name: string;

  @Field(() => String)
  code: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  static fromEntity(entity: Subject | null | undefined): SubjectModel {
    if (!entity) {
      throw new Error('Subject entity not found');
    }
    const model = new SubjectModel();
    model.id = entity.id;
    model.name = entity.name;
    model.code = entity.code;
    model.description = entity.description ?? null;
    return model;
  }
}
