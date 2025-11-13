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
import { Teacher } from '../../teachers/entities/teacher.entity';

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

  @ManyToOne(() => Course, (course) => course.attendanceRecords, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => Student, (student) => student.attendanceRecords, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Teacher, (teacher) => teacher.attendanceRecords, {
    eager: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'enum', enum: AttendanceStatus, default: AttendanceStatus.PRESENT })
  status: AttendanceStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
