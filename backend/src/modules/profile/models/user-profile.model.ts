import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserRole } from '../../users/entities/user.entity';
import { PersonModel } from '../../person/models/person.model';
import { TeacherModel } from '../../teachers/models/teacher.model';
import { StudentModel } from '../../students/models/student.model';
import { CourseModel } from '../../courses/models/course.model';
import { EnrollmentModel } from '../../enrollments/models/enrollment.model';
import { GradeModel } from '../../grades/models/grade.model';

@ObjectType()
export class UserProfileModel {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  username: string;

  @Field(() => String)
  email: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => PersonModel, { nullable: true })
  person?: PersonModel | null;

  @Field(() => TeacherModel, { nullable: true })
  teacher?: TeacherModel | null;

  @Field(() => [CourseModel], { nullable: true })
  courses?: CourseModel[] | null;

  @Field(() => StudentModel, { nullable: true })
  student?: StudentModel | null;

  @Field(() => [EnrollmentModel], { nullable: true })
  enrollments?: EnrollmentModel[] | null;

  @Field(() => [GradeModel], { nullable: true })
  grades?: GradeModel[] | null;

  static fromProfile(profile: any): UserProfileModel {
    const model = new UserProfileModel();
    model.id = profile.id;
    model.username = profile.username;
    model.email = profile.email;
    model.role = profile.role;
    model.isActive = profile.isActive;
    model.person = PersonModel.fromEntity(profile.person);
    model.teacher = profile.teacher ? TeacherModel.fromEntity(profile.teacher) : null;
    model.courses = Array.isArray(profile.courses)
      ? profile.courses
          .map((course: any) => CourseModel.fromEntity(course))
          .filter((item: CourseModel | null): item is CourseModel => item !== null)
      : null;
    model.student = profile.student ? StudentModel.fromEntity(profile.student) : null;
    model.enrollments = Array.isArray(profile.enrollments)
      ? profile.enrollments
          .map((enrollment: any) => EnrollmentModel.fromEntity(enrollment))
          .filter((item: EnrollmentModel | null): item is EnrollmentModel => item !== null)
      : null;
    model.grades = Array.isArray(profile.grades)
      ? profile.grades
          .map((grade: any) => GradeModel.fromEntity(grade))
          .filter((item: GradeModel | null): item is GradeModel => item !== null)
      : null;
    return model;
  }
}
