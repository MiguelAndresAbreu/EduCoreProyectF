import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Person } from '../../person/entities/person.entity';
import { User } from '../../users/entities/user.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { Grade } from '../../grades/entities/grade.entity';
import { Payment } from '../../payments/entities/payment.entity';

@Entity({ name: 'students' })
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Person, (person) => person.student, { eager: true })
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @OneToOne(() => User, (user) => user.student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'enrollment_date' })
  enrollmentDate: Date;

  @Column({ default: 'ACTIVE' })
  status: string;

  @Column({ name: 'grade_level', nullable: true })
  gradeLevel?: string;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.student)
  enrollments: Enrollment[];

  @OneToMany(() => Attendance, (attendance) => attendance.student)
  attendanceRecords: Attendance[];

  @OneToMany(() => Grade, (grade) => grade.student)
  grades: Grade[];

  @OneToMany(() => Payment, (payment) => payment.student)
  payments: Payment[];
}
