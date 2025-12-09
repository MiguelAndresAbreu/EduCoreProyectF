import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { Grade } from './entities/grade.entity';
import { CreateGradeInput, UpdateGradeInput } from './inputs/grade.input';
import { CoursesService } from '../courses/courses.service';
import { StudentsService } from '../students/students.service';
import { TeachersService } from '../teachers/teachers.service';
import { StudentModel } from '../students/models/student.model';
import { CourseModel } from '../courses/models/course.model';
import { SubjectAverageModel, GradeTypeAverageModel, CourseStudentSummaryModel, StudentGradesReportModel, CourseGradesReportModel } from './models/grade.model';

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

  private computeSubjectAverages(grades: Grade[]): SubjectAverageModel[] {
    const acc = new Map<number, { total: number; count: number; name: string }>();
    grades.forEach((grade) => {
      const subject = grade.course?.subject;
      if (!subject) return;
      const current = acc.get(subject.id) ?? { total: 0, count: 0, name: subject.name };
      current.total += Number(grade.value);
      current.count += 1;
      acc.set(subject.id, current);
    });
    return Array.from(acc.entries()).map(([subjectId, { total, count, name }]) => ({
      subjectId,
      subjectName: name,
      average: count ? Number((total / count).toFixed(2)) : 0,
    }));
  }

  private computeTypeAverages(grades: Grade[]): GradeTypeAverageModel[] {
    const acc = new Map<string, { total: number; count: number }>();
    grades.forEach((grade) => {
      const current = acc.get(grade.type) ?? { total: 0, count: 0 };
      current.total += Number(grade.value);
      current.count += 1;
      acc.set(grade.type, current);
    });
    return Array.from(acc.entries()).map(([type, { total, count }]) => ({
      type,
      average: count ? Number((total / count).toFixed(2)) : 0,
    }));
  }

  async studentReportByCourse(courseId: number, studentId: number): Promise<StudentGradesReportModel> {
    const course = await this.coursesService.findOne(courseId);
    const student = await this.studentsService.findOne(studentId);
    const grades = await this.gradeRepository.find({
      where: { course: { id: course.id }, student: { id: student.id } },
      relations: ['course', 'course.subject', 'student', 'student.person', 'teacher'],
      order: { date: 'DESC' },
    });

    const gradeModels = grades.map((g) => g);
    const subjectAverages = this.computeSubjectAverages(gradeModels);
    const typeAverages = this.computeTypeAverages(gradeModels);
    const overallAverage = this.getAverageForStudent(gradeModels);

    const studentModel = StudentModel.fromEntity(student);
    const courseModel = CourseModel.fromEntity(course, { includeEnrollments: false });
    if (!studentModel || !courseModel) {
      throw new NotFoundException('No se pudo construir el reporte');
    }

    return {
      student: studentModel,
      course: courseModel,
      subject: courseModel.subject,
      grades: grades,
      subjectAverages,
      typeAverages,
      overallAverage,
    };
  }

  async courseReport(courseId: number): Promise<CourseGradesReportModel> {
    const course = await this.coursesService.findOne(courseId);
    const grades = await this.gradeRepository.find({
      where: { course: { id: course.id } },
      relations: ['course', 'course.subject', 'student', 'student.person', 'teacher'],
      order: { date: 'DESC' },
    });

    const byStudent = new Map<number, Grade[]>();
    grades.forEach((grade) => {
      const key = grade.student.id;
      const list = byStudent.get(key) ?? [];
      list.push(grade);
      byStudent.set(key, list);
    });

    const studentsSummaries: CourseStudentSummaryModel[] = [];
    byStudent.forEach((studentGrades, studentId) => {
      const student = studentGrades[0].student;
      const studentModel = StudentModel.fromEntity(student);
      if (!studentModel) return;
      studentsSummaries.push({
        student: studentModel,
        overallAverage: this.getAverageForStudent(studentGrades),
        subjectAverages: this.computeSubjectAverages(studentGrades),
      });
    });

    const overallAverage = studentsSummaries.length
      ? Number(
          (
            studentsSummaries.reduce((sum, s) => sum + (s.overallAverage ?? 0), 0) /
            studentsSummaries.length
          ).toFixed(2),
        )
      : 0;

    const courseModel = CourseModel.fromEntity(course, { includeEnrollments: false });
    if (!courseModel) {
      throw new NotFoundException('No se pudo construir el reporte de curso');
    }

    return {
      course: courseModel,
      students: studentsSummaries,
      overallAverage,
    };
  }
}
