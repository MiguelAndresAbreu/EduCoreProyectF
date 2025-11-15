import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import { AttendanceService } from '../attendance.service';
import { AttendanceModel, AttendanceResultModel } from '../models/attendance.model';
import { RecordAttendanceInput } from '../inputs/record-attendance.input';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { TeachersService } from '../../teachers/teachers.service';
import { StudentsService } from '../../students/students.service';
import { CoursesService } from '../../courses/courses.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { UserRole } from '@/modules/users/entities/user.entity';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Resolver(() => AttendanceModel)
export class AttendanceResolver {
  constructor(
      private readonly attendanceService: AttendanceService,
      private readonly teachersService: TeachersService,
      private readonly studentsService: StudentsService,
      private readonly coursesService: CoursesService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Mutation(() => AttendanceModel)
  async recordAttendance(
      @Args('input') input: RecordAttendanceInput,
      @CurrentUser() user: JwtPayload,
  ): Promise<AttendanceModel> {
    if (user.role === UserRole.TEACHER && user.sub !== input.teacherId) {
      throw new ForbiddenException('Solo puedes registrar asistencia para tus cursos');
    }
    const record = await this.attendanceService.registerAttendance(input);
    const model = AttendanceModel.fromEntity(record);
    if (!model) {
      throw new Error('No se pudo registrar la asistencia');
    }
    return model;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Query(() => AttendanceResultModel)
  async attendanceByCourse(
      @Args('courseId', { type: () => Int }) courseId: number,
      @Args('date', { type: () => String, nullable: true }) date: string | null,
      @CurrentUser() user: JwtPayload,
  ): Promise<AttendanceResultModel> {
    if (user.role === UserRole.TEACHER) {
      const teacher = await this.teachersService.findByUserId(user.sub);
      const course = await this.coursesService.findOne(courseId);
      if (!teacher || course.teacher.id !== teacher.id) {
        throw new ForbiddenException('No autorizado para ver esta asistencia');
      }
    }
    const result = await this.attendanceService.findByCourse(courseId, date ?? undefined);
    return {
      records: result.records
          .map((record) => AttendanceModel.fromEntity(record))
          .filter((item): item is AttendanceModel => item !== null),
      summary: { ...result.summary },
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @Query(() => AttendanceResultModel)
  async attendanceByStudent(
      @Args('studentId', { type: () => Int }) studentId: number,
      @Args('startDate', { type: () => String, nullable: true }) startDate: string | null,
      @Args('endDate', { type: () => String, nullable: true }) endDate: string | null,
      @CurrentUser() user: JwtPayload,
  ): Promise<AttendanceResultModel> {
    if (user.role === UserRole.STUDENT) {
      const student = await this.studentsService.findByUserId(user.sub);
      if (!student || student.id !== studentId) {
        throw new ForbiddenException('No autorizado para ver esta asistencia');
      }
    }
    const result = await this.attendanceService.findByStudent(studentId, {
      startDate: startDate ?? undefined,
      endDate: endDate ?? undefined,
    });
    return {
      records: result.records
          .map((record) => AttendanceModel.fromEntity(record))
          .filter((item): item is AttendanceModel => item !== null),
      summary: { ...result.summary },
    };
  }
}
