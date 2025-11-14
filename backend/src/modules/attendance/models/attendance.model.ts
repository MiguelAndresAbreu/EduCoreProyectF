import { Field, Float, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Attendance, AttendanceStatus } from '../entities/attendance.entity';
import { CourseModel } from '../../courses/models/course.model';
import { StudentModel } from '../../students/models/student.model';
import { TeacherModel } from '../../teachers/models/teacher.model';

registerEnumType(AttendanceStatus, { name: 'AttendanceStatus' });

@ObjectType()
export class AttendanceModel {
  @Field(() => ID)
  id: number;

  @Field(() => CourseModel)
  course: CourseModel;

  @Field(() => StudentModel)
  student: StudentModel;

  @Field(() => TeacherModel, { nullable: true })
  teacher?: TeacherModel | null;

  @Field(() => String)
  date: string;

  @Field(() => AttendanceStatus)
  status: AttendanceStatus;

  @Field(() => Date)
  createdAt: Date;

  static fromEntity(entity: Attendance | null | undefined): AttendanceModel | null {
    if (!entity) {
      return null;
    }
    const model = new AttendanceModel();
    model.id = entity.id;
    model.course = CourseModel.fromEntity(entity.course, { includeEnrollments: false });
    const student = StudentModel.fromEntity(entity.student);
    if (!student) {
      throw new Error('Attendance entity is missing student relation');
    }
    model.student = student;
    model.teacher = TeacherModel.fromEntity(entity.teacher) ?? null;
    model.date = entity.date;
    model.status = entity.status;
    model.createdAt = entity.createdAt;
    return model;
  }
}

@ObjectType()
export class AttendanceSummaryModel {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  present: number;

  @Field(() => Int)
  absent: number;

  @Field(() => Int)
  late: number;

  @Field(() => Float)
  attendanceRate: number;
}

@ObjectType()
export class AttendanceResultModel {
  @Field(() => [AttendanceModel])
  records: AttendanceModel[];

  @Field(() => AttendanceSummaryModel)
  summary: AttendanceSummaryModel;
}
