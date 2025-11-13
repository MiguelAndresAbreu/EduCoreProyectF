import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Course } from '../../courses/entities/course.entity';
import { Student } from '../../students/entities/student.entity';
import { User } from '../../users/entities/user.entity';

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
}

@Entity({ name: 'attendance' })
@Unique(['course', 'student', 'date'])
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Course, (course) => course.attendanceRecords, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => Student, (student) => student.attendanceRecords, { eager: true })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'enum', enum: AttendanceStatus, default: AttendanceStatus.PRESENT })
  status: AttendanceStatus;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'recorded_by' })
  recordedBy: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
