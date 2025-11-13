import { IsDateString, IsEnum, IsInt } from 'class-validator';
import { AttendanceStatus } from '../entities/attendance.entity';

export class CreateAttendanceDto {
  @IsInt()
  courseId: number;

  @IsInt()
  studentId: number;

  @IsDateString()
  date: string;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}
