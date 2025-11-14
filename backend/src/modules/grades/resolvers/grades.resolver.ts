import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import { GradesService } from '../grades.service';
import { GradeModel } from '../models/grade.model';
import { CreateGradeInput } from '../models/grade.input';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { TeachersService } from '../../teachers/teachers.service';
import { StudentsService } from '../../students/students.service';
import { CoursesService } from '../../courses/courses.service';

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
    if (user.role === UserRole.TEACHER && user.sub !== input.teacherId) {
      throw new ForbiddenException('Solo puedes registrar calificaciones para tus cursos');
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
  @Query(() => [GradeModel])
  async gradesByCourse(
    @Args('courseId', { type: () => Int }) courseId: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<GradeModel[]> {
    if (user.role === UserRole.TEACHER) {
      const teacher = await this.teachersService.findByUserId(user.sub);
      const course = await this.coursesService.findOne(courseId);
      if (!teacher || course.teacher.id !== teacher.id) {
        throw new ForbiddenException('No autorizado para ver este curso');
      }
    }
    const grades = await this.gradesService.findByCourse(courseId);
    return grades
      .map((grade) => GradeModel.fromEntity(grade))
      .filter((item): item is GradeModel => item !== null);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @Query(() => [GradeModel])
  async gradesByStudent(
    @Args('studentId', { type: () => Int }) studentId: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<GradeModel[]> {
    if (user.role === UserRole.STUDENT) {
      const student = await this.studentsService.findByUserId(user.sub);
      if (!student || student.id !== studentId) {
        throw new ForbiddenException('No autorizado para ver estas calificaciones');
      }
    }
    const grades = await this.gradesService.findByStudent(studentId);
    return grades
      .map((grade) => GradeModel.fromEntity(grade))
      .filter((item): item is GradeModel => item !== null);
  }
}
