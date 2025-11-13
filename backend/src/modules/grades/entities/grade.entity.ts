import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Course } from '../../courses/entities/course.entity';
import { Student } from '../../students/entities/student.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'grades' })
export class Grade {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Course, (course) => course.grades, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => Student, (student) => student.grades, { eager: true })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column()
  type: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  maxScore: number;

  @Column({ type: 'date' })
  date: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'graded_by' })
  gradedBy: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
