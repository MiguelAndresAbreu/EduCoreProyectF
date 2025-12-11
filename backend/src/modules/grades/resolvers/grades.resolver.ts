import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import { GradesService } from '../grades.service';
import {
  GradeModel,
  GradeReportModel,
  StudentGradesReportModel,
  CourseGradesReportModel,
  ExportPayloadModel,
} from '../models/grade.model';
import { CreateGradeInput, UpdateGradeInput } from '../inputs/grade.input';
import { UserRole } from '../../users/entities/user.entity';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { TeachersService } from '../../teachers/teachers.service';
import { StudentsService } from '../../students/students.service';
import { CoursesService } from '../../courses/courses.service';
import {RolesGuard} from "@/common/guards/roles.guard";
import {JwtAuthGuard} from "@/common/guards/jwt-auth.guard";
import {Roles} from "@/common/decorators/roles.decorator";
import {CurrentUser} from "@/common/decorators/current-user.decorator";

@Resolver(() => GradeModel)
export class GradesResolver {
  constructor(
    private readonly gradesService: GradesService,
    private readonly teachersService: TeachersService,
    private readonly studentsService: StudentsService,
    private readonly coursesService: CoursesService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Mutation(() => GradeModel)
  async createGrade(
    @Args('input') input: CreateGradeInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<GradeModel> {
    if (user.role === UserRole.TEACHER) {
      const teacher = await this.teachersService.findByUserId(user.sub);
      if (!teacher) {
        throw new ForbiddenException('No autorizado para registrar calificaciones');
      }
      input.teacherId = teacher.id;
    }
    const grade = await this.gradesService.create(input);
    const model = GradeModel.fromEntity(grade);
    if (!model) {
      throw new Error('No se pudo crear la calificación');
    }
    return model;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Mutation(() => GradeModel)
  async updateGrade(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateGradeInput,
  ): Promise<GradeModel> {
    const updated = await this.gradesService.update(id, input);
    const model = GradeModel.fromEntity(updated);
    if (!model) {
      throw new Error('Calificación no encontrada');
    }
    return model;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.TEACHER)
  @Query(() => [GradeModel])
  async gradesByCourse(
    @CurrentUser() user: JwtPayload,
    @Args('courseId', { type: () => Int }) courseId: number,
    @Args('subjectId', { type: () => Int, nullable: true }) subjectId?: number,
    @Args('type', { type: () => String, nullable: true }) type?: string,
    @Args('startDate', { type: () => String, nullable: true }) startDate?: string,
    @Args('endDate', { type: () => String, nullable: true }) endDate?: string,
  ): Promise<GradeModel[]> {
    if (user.role === UserRole.TEACHER) {
      const teacher = await this.teachersService.findByUserId(user.sub);
      const course = await this.coursesService.findOne(courseId);
      if (!teacher || course.teacher.id !== teacher.id) {
        throw new ForbiddenException('No autorizado para ver este curso');
      }
    }
    const grades = await this.gradesService.findByCourse(courseId, { subjectId, type, startDate, endDate });
    return grades
      .map((grade) => GradeModel.fromEntity(grade))
      .filter((item): item is GradeModel => item !== null);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.TEACHER, UserRole.STUDENT)
  @Query(() => [GradeModel])
  async gradesByStudent(
    @CurrentUser() user: JwtPayload,
    @Args('studentId', { type: () => Int }) studentId: number,
    @Args('subjectId', { type: () => Int, nullable: true }) subjectId?: number,
    @Args('type', { type: () => String, nullable: true }) type?: string,
    @Args('startDate', { type: () => String, nullable: true }) startDate?: string,
    @Args('endDate', { type: () => String, nullable: true }) endDate?: string,
  ): Promise<GradeModel[]> {
    if (user.role === UserRole.STUDENT) {
      const student = await this.studentsService.findByUserId(user.sub);
      if (!student || student.id !== studentId) {
        throw new ForbiddenException('No autorizado para ver estas calificaciones');
      }
    }
    const grades = await this.gradesService.findByStudent(studentId, { subjectId, type, startDate, endDate } as any);
    return grades
      .map((grade) => GradeModel.fromEntity(grade))
      .filter((item): item is GradeModel => item !== null);
  }

  // Reporte global: solo ADMIN
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Query(() => GradeReportModel)
  async gradesReport(
    @Args('courseId', { type: () => Int, nullable: true }) courseId?: number,
    @Args('studentId', { type: () => Int, nullable: true }) studentId?: number,
    @Args('startDate', { type: () => String, nullable: true }) startDate?: string,
    @Args('endDate', { type: () => String, nullable: true }) endDate?: string,
    @Args('subjectId', { type: () => Int, nullable: true }) subjectId?: number,
    @Args('type', { type: () => String, nullable: true }) type?: string,
  ): Promise<GradeReportModel> {
    const report = await this.gradesService.report({
      courseId,
      studentId,
      startDate,
      endDate,
      subjectId,
      type,
    });

    return {
      grades: report.data
        .map((grade) => GradeModel.fromEntity(grade))
        .filter((item): item is GradeModel => item !== null),
      average: report.average,
      averagesByStudent: report.averagesByStudent.map((item) => ({
        studentId: item.studentId,
        average: item.average,
      })),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Query(() => StudentGradesReportModel)
  async studentGradesReport(
    @Args('courseId', { type: () => Int }) courseId: number,
    @Args('studentId', { type: () => Int }) studentId: number,
    @Args('subjectId', { type: () => Int, nullable: true }) subjectId?: number,
    @Args('type', { type: () => String, nullable: true }) type?: string,
    @Args('startDate', { type: () => String, nullable: true }) startDate?: string,
    @Args('endDate', { type: () => String, nullable: true }) endDate?: string,
  ): Promise<StudentGradesReportModel> {
    const report = await this.gradesService.studentReportByCourse(courseId, studentId, {
      subjectId,
      type,
      startDate,
      endDate,
    });
    return {
      student: report.student,
      course: report.course,
      subject: report.subject ?? null,
      grades: report.grades
        .map((grade) => GradeModel.fromEntity(grade as any)) // Conversión segura
        .filter((g): g is GradeModel => g !== null),
      subjectAverages: report.subjectAverages,
      typeAverages: report.typeAverages,
      overallAverage: report.overallAverage,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Query(() => CourseGradesReportModel)
  async courseGradesReport(
    @Args('courseId', { type: () => Int }) courseId: number,
    @Args('subjectId', { type: () => Int, nullable: true }) subjectId?: number,
    @Args('type', { type: () => String, nullable: true }) type?: string,
    @Args('startDate', { type: () => String, nullable: true }) startDate?: string,
    @Args('endDate', { type: () => String, nullable: true }) endDate?: string,
  ): Promise<CourseGradesReportModel> {
    const report = await this.gradesService.courseReport(courseId, { subjectId, type, startDate, endDate });
    return {
      course: report.course,
      students: report.students,
      overallAverage: report.overallAverage,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Query(() => ExportPayloadModel)
  async exportStudentGradesPdf(
    @Args('courseId', { type: () => Int }) courseId: number,
    @Args('studentId', { type: () => Int }) studentId: number,
  ): Promise<ExportPayloadModel> {
    // Stub: In a real scenario we would generate the PDF and return a signed URL.
    const url = `/reports/grades/student-${studentId}-course-${courseId}.pdf`;
    return { url, expiresAt: null };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Query(() => ExportPayloadModel)
  async exportCourseGradesPdf(
    @Args('courseId', { type: () => Int }) courseId: number,
  ): Promise<ExportPayloadModel> {
    const url = `/reports/grades/course-${courseId}.pdf`;
    return { url, expiresAt: null };
  }
}
