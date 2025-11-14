import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ReportsService } from '../reports.service';
import {
  AttendanceReportModel,
  GradesReportModel,
  PaymentsReportModel,
  PerformanceReportModel,
  PaymentsTotalsModel,
} from '../models/report.models';
import { AttendanceModel } from '../../attendance/models/attendance.model';
import { GradeModel } from '../../grades/models/grade.model';
import { PaymentModel } from '../../payments/models/payment.model';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { StudentsService } from '../../students/students.service';

@Resolver()
export class ReportsResolver {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly studentsService: StudentsService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.TEACHER)
  @Query(() => AttendanceReportModel)
  async attendanceReport(
    @Args('courseId', { type: () => Int, nullable: true }) courseId?: number,
    @Args('studentId', { type: () => Int, nullable: true }) studentId?: number,
    @Args('teacherId', { type: () => Int, nullable: true }) teacherId?: number,
    @Args('startDate', { nullable: true }) startDate?: string,
    @Args('endDate', { nullable: true }) endDate?: string,
  ): Promise<AttendanceReportModel> {
    const report = await this.reportsService.attendanceReport({
      courseId,
      studentId,
      teacherId,
      startDate,
      endDate,
    });
    return {
      records: report.records
        .map((record) => AttendanceModel.fromEntity(record))
        .filter((item): item is AttendanceModel => item !== null),
      summary: { ...report.summary },
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.TEACHER)
  @Query(() => GradesReportModel)
  async gradesReport(
    @Args('courseId', { type: () => Int, nullable: true }) courseId?: number,
    @Args('studentId', { type: () => Int, nullable: true }) studentId?: number,
    @Args('startDate', { nullable: true }) startDate?: string,
    @Args('endDate', { nullable: true }) endDate?: string,
  ): Promise<GradesReportModel> {
    const report = await this.reportsService.gradesReport({ courseId, studentId, startDate, endDate });
    return {
      data: report.data
        .map((grade) => GradeModel.fromEntity(grade))
        .filter((item): item is GradeModel => item !== null),
      average: report.average,
      averagesByStudent: report.averagesByStudent,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.FINANCE, UserRole.STAFF)
  @Query(() => PaymentsReportModel)
  async paymentsReport(
    @Args('studentId', { type: () => Int, nullable: true }) studentId?: number,
    @Args('startDate', { nullable: true }) startDate?: string,
    @Args('endDate', { nullable: true }) endDate?: string,
  ): Promise<PaymentsReportModel> {
    const report = await this.reportsService.paymentsReport({ studentId, startDate, endDate });
    return {
      payments: report.payments
        .map((payment) => PaymentModel.fromEntity(payment))
        .filter((item): item is PaymentModel => item !== null),
      totals: { ...report.totals } as PaymentsTotalsModel,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.TEACHER, UserRole.STUDENT)
  @Query(() => PerformanceReportModel)
  async studentPerformance(
    @Args('studentId', { type: () => Int }) studentId: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<PerformanceReportModel> {
    if (user.role === UserRole.STUDENT) {
      const student = await this.studentsService.findByUserId(user.sub);
      if (!student || student.id !== studentId) {
        throw new Error('No autorizado para ver este reporte');
      }
    }
    const report = await this.reportsService.academicPerformanceSummary(studentId);
    return {
      averageGrade: report.averageGrade,
      attendanceRate: report.attendanceRate,
      financialStatus: { ...report.financialStatus } as PaymentsTotalsModel,
      attendance: { ...report.attendance },
      grades: report.grades
        .map((grade) => GradeModel.fromEntity(grade))
        .filter((item): item is GradeModel => item !== null),
      payments: report.payments
        .map((payment) => PaymentModel.fromEntity(payment))
        .filter((item): item is PaymentModel => item !== null),
    };
  }
}
