import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Subject } from '../../subjects/entities/subject.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { Grade } from '../../grades/entities/grade.entity';

@Entity({ name: 'courses' })
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Subject, (subject) => subject.courses, { eager: true })
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @ManyToOne(() => Teacher, (teacher) => teacher.courses, { eager: true })
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @Column({ nullable: true })
  schedule?: string;

  @Column({ type: 'int', default: 30 })
  capacity: number;

  @Column({ nullable: true })
  room?: string;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments: Enrollment[];

  @OneToMany(() => Attendance, (attendance) => attendance.course)
  attendanceRecords: Attendance[];

  @OneToMany(() => Grade, (grade) => grade.course)
  grades: Grade[];
}
