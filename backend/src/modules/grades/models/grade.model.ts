import { Field, Float, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Grade, GradeType } from '../entities/grade.entity';
import { CourseModel } from '../../courses/models/course.model';
import { StudentModel } from '../../students/models/student.model';
import { TeacherModel } from '../../teachers/models/teacher.model';

registerEnumType(GradeType, { name: 'GradeType' });

@ObjectType()
export class GradeModel {
  @Field(() => ID)
  id: number;

  @Field(() => CourseModel)
  course: CourseModel;

  @Field(() => StudentModel)
  student: StudentModel;

  @Field(() => TeacherModel, { nullable: true })
  teacher?: TeacherModel | null;

  @Field(() => GradeType)
  type: GradeType;

  @Field(() => Float)
  value: number;

  @Field(() => String)
  date: string;

  @Field(() => Date)
  createdAt: Date;

  static fromEntity(entity: Grade | null | undefined): GradeModel | null {
    if (!entity) {
      return null;
    }
    const model = new GradeModel();
    model.id = entity.id;
    model.course = CourseModel.fromEntity(entity.course, { includeEnrollments: false });
    const student = StudentModel.fromEntity(entity.student);
    if (!student) {
      throw new Error('Grade entity is missing student relation');
    }
    model.student = student;
    model.teacher = TeacherModel.fromEntity(entity.teacher) ?? null;
    model.type = entity.type;
    model.value = Number(entity.value);
    model.date = entity.date;
    model.createdAt = entity.createdAt;
    return model;
  }
}

@ObjectType()
export class GradeStudentAverageModel {
  @Field(() => Int)
  studentId: number;

  @Field(() => Float)
  average: number;
}

@ObjectType()
export class GradeReportModel {
  @Field(() => [GradeModel])
  grades: GradeModel[];

  @Field(() => Float)
  average: number;

  @Field(() => [GradeStudentAverageModel])
  averagesByStudent: GradeStudentAverageModel[];
}
