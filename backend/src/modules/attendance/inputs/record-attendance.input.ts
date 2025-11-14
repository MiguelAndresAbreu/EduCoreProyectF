import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsInt, IsISO8601 } from 'class-validator';
import { AttendanceStatus } from '../entities/attendance.entity';

@InputType()
export class RecordAttendanceInput {
  @Field(() => Int)
  @IsInt()
  courseId: number;

  @Field(() => Int)
  @IsInt()
  studentId: number;

  @Field(() => Int)
  @IsInt()
  teacherId: number;

  @Field(() => String)
  @IsISO8601()
  date: string;

  @Field(() => AttendanceStatus)
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}
