import { Field, Float, InputType } from '@nestjs/graphql';
import { GradeType } from '../entities/grade.entity';

@InputType()
export class CreateGradeInput {
  @Field()
  courseId: number;

  @Field()
  studentId: number;

  @Field()
  teacherId: number;

  @Field(() => GradeType)
  type: GradeType;

  @Field(() => Float)
  value: number;

  @Field()
  date: string;
}
