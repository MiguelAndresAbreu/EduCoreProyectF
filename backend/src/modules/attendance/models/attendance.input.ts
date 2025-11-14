import { Field, InputType } from '@nestjs/graphql';
import { AttendanceStatus } from '../entities/attendance.entity';

@InputType()
export class RecordAttendanceInput {
  @Field()
  courseId: number;

  @Field()
  studentId: number;

  @Field()
  teacherId: number;

  @Field()
  date: string;

  @Field(() => AttendanceStatus)
  status: AttendanceStatus;
}
