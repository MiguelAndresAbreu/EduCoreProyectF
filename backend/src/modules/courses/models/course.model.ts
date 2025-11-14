import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Course } from '../entities/course.entity';
import { SubjectModel } from '../../subjects/models/subject.model';
import { TeacherModel } from '../../teachers/models/teacher.model';
import { EnrollmentModel } from '../../enrollments/models/enrollment.model';

@ObjectType()
export class CourseModel {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  name: string;

  @Field(() => SubjectModel)
  subject: SubjectModel;

  @Field(() => TeacherModel)
  teacher: TeacherModel;

  @Field(() => String, { nullable: true })
  schedule?: string | null;

  @Field(() => Int)
  capacity: number;

  @Field(() => String, { nullable: true })
  room?: string | null;

  @Field(() => [EnrollmentModel], { nullable: true })
  enrollments?: (EnrollmentModel | null)[] | null;

  static fromEntity(
    entity: Course | null | undefined,
    options?: { includeEnrollments?: boolean },
  ): CourseModel {
    if (!entity) {
      throw new Error('Course entity not found');
    }
    const model = new CourseModel();
    model.id = entity.id;
    model.name = entity.name;
    model.subject = SubjectModel.fromEntity(entity.subject);
    const teacher = TeacherModel.fromEntity(entity.teacher);
    if (!teacher) {
      throw new Error('Course entity is missing teacher relation');
    }
    model.teacher = teacher;
    model.schedule = entity.schedule ?? null;
    model.capacity = entity.capacity;
    model.room = entity.room ?? null;
    if (options?.includeEnrollments !== false && Array.isArray(entity.enrollments)) {
      model.enrollments = entity.enrollments
        .map((enrollment) => EnrollmentModel.fromEntity(enrollment, { includeCourse: false }))
        .filter((item): item is EnrollmentModel => item !== null);
    } else {
      model.enrollments = null;
    }
    return model;
  }
}
