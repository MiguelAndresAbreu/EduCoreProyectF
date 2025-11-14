import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { Grade } from './entities/grade.entity';
import { CreateGradeInput, UpdateGradeInput } from './inputs/grade.input';
import { CoursesService } from '../courses/courses.service';
import { StudentsService } from '../students/students.service';
import { TeachersService } from '../teachers/teachers.service';

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,
    private readonly coursesService: CoursesService,
    private readonly studentsService: StudentsService,
    private readonly teachersService: TeachersService,
  ) {}

  async create(createGradeInput: CreateGradeInput) {
    const course = await this.coursesService.findOne(createGradeInput.courseId);
    const student = await this.studentsService.findOne(createGradeInput.studentId);
    if (!createGradeInput.teacherId) {
      throw new NotFoundException('Debe indicar el docente que registra la calificación');
    }
    const teacher = await this.teachersService.findOne(createGradeInput.teacherId);

    if (course.teacher.id !== teacher.id) {
      throw new NotFoundException('El docente no está asignado al curso seleccionado');
    }

    const grade = this.gradeRepository.create({
      course,
      student,
      teacher,
      type: createGradeInput.type,
      value: createGradeInput.value,
      date: createGradeInput.date,
    });

    return this.gradeRepository.save(grade);
  }

  async update(id: number, updateGradeInput: UpdateGradeInput) {
    const grade = await this.gradeRepository.findOne({
      where: { id },
      relations: ['course', 'student', 'teacher'],
    });
    if (!grade) {
      throw new NotFoundException('Calificación no encontrada');
    }

    if (updateGradeInput.courseId) {
      grade.course = await this.coursesService.findOne(updateGradeInput.courseId);
    }

    if (updateGradeInput.studentId) {
      grade.student = await this.studentsService.findOne(updateGradeInput.studentId);
    }

    if (updateGradeInput.teacherId) {
      grade.teacher = await this.teachersService.findOne(updateGradeInput.teacherId);
    }

    Object.assign(grade, {
      type: updateGradeInput.type ?? grade.type,
      value: updateGradeInput.value ?? grade.value,
      date: updateGradeInput.date ?? grade.date,
    });

    return this.gradeRepository.save(grade);
  }

  async findByStudent(studentId: number) {
    const student = await this.studentsService.findOne(studentId);
    return this.gradeRepository.find({
      where: { student: { id: student.id } },
      relations: ['course', 'course.subject', 'teacher'],
      order: { date: 'DESC' },
    });
  }

  async findByCourse(courseId: number) {
    const course = await this.coursesService.findOne(courseId);
    return this.gradeRepository.find({
      where: { course: { id: course.id } },
      relations: ['student', 'student.person', 'teacher'],
      order: { date: 'DESC' },
    });
  }

  async report(options: {
    courseId?: number;
    studentId?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const where: FindOptionsWhere<Grade> = {};

    if (options.courseId) {
      where.course = { id: options.courseId } as any;
    }

    if (options.studentId) {
      where.student = { id: options.studentId } as any;
    }

    if (options.startDate && options.endDate) {
      where.date = Between(options.startDate, options.endDate);
    } else if (options.startDate) {
      where.date = Between(options.startDate, options.startDate);
    }

    const grades = await this.gradeRepository.find({
      where,
      relations: ['student', 'student.person', 'course', 'course.subject', 'teacher'],
      order: { date: 'DESC' },
    });

    const averagesByStudent = grades.reduce<Record<number, { total: number; count: number }>>(
      (acc, grade) => {
        const key = grade.student.id;
        if (!acc[key]) {
          acc[key] = { total: 0, count: 0 };
        }
        acc[key].total += Number(grade.value);
        acc[key].count += 1;
        return acc;
      },
      {},
    );

    const average = grades.length
      ? Number((grades.reduce((sum, grade) => sum + Number(grade.value), 0) / grades.length).toFixed(2))
      : 0;

    return {
      data: grades,
      average,
      averagesByStudent: Object.entries(averagesByStudent).map(([studentId, value]) => ({
        studentId: Number(studentId),
        average: Number((value.total / value.count).toFixed(2)),
      })),
    };
  }

  getAverageForStudent(grades: Grade[]): number {
    if (!grades.length) {
      return 0;
    }
    const total = grades.reduce((sum, grade) => sum + Number(grade.value), 0);
    return Number((total / grades.length).toFixed(2));
  }
}
