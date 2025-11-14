import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Enrollment } from '../entities/enrollment.entity';
import { CourseModel } from '../../courses/models/course.model';
import { StudentModel } from '../../students/models/student.model';

@ObjectType()
export class EnrollmentModel {
  @Field(() => ID)
  id: number;

  @Field(() => StudentModel)
  student: StudentModel;

  @Field(
    () =>
      import('../../courses/models/course.model').then((m) => m.CourseModel),
    { nullable: true },
  )
  course?: CourseModel | null;

  @Field(() => Date)
  enrolledAt: Date;

  @Field(() => String)
  status: string;

  static fromEntity(
    entity: Enrollment | null | undefined,
    options?: { includeCourse?: boolean },
  ): EnrollmentModel {
    if (!entity) {
      throw new Error('Enrollment entity not found');
    }
    const model = new EnrollmentModel();
    model.id = entity.id;
    const student = StudentModel.fromEntity(entity.student);
    if (!student) {
      throw new Error('Enrollment entity is missing student relation');
    }
    model.student = student;
    model.course =
      options?.includeCourse === true
        ? CourseModel.fromEntity(entity.course, { includeEnrollments: false })
        : null;
    model.enrolledAt = entity.enrolledAt;
    model.status = entity.status;
    return model;
  }
}
