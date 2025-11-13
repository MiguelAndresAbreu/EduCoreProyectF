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
import { Teacher } from '../../teachers/entities/teacher.entity';

export enum GradeType {
  EXAM = 'EXAM',
  HOMEWORK = 'HOMEWORK',
  QUIZ = 'QUIZ',
  PROJECT = 'PROJECT',
  PARTICIPATION = 'PARTICIPATION',
}

@Entity({ name: 'grades' })
export class Grade {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Course, (course) => course.grades, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => Student, (student) => student.grades, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Teacher, (teacher) => teacher.grades, {
    eager: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @Column({ type: 'enum', enum: GradeType })
  type: GradeType;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  value: number;

  @Column({ type: 'date' })
  date: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
