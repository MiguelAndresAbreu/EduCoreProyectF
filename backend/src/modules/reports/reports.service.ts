import { Injectable } from '@nestjs/common';
import { AttendanceService } from '../attendance/attendance.service';
import { GradesService } from '../grades/grades.service';
import { PaymentsService } from '../payments/payments.service';
import { FinanceService } from '../finance/finance.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly gradesService: GradesService,
    private readonly paymentsService: PaymentsService,
    private readonly financeService: FinanceService,
  ) {}

  attendanceReport(params: {
    courseId?: number;
    studentId?: number;
    teacherId?: number;
    startDate?: string;
    endDate?: string;
  }) {
    return this.attendanceService.getReport(params);
  }

  gradesReport(params: { courseId?: number; studentId?: number; startDate?: string; endDate?: string }) {
    return this.gradesService.report(params);
  }

  paymentsReport(params: { studentId?: number; startDate?: string; endDate?: string }) {
    return this.paymentsService.getReport(params);
  }

  async academicPerformanceSummary(studentId: number) {
    const [attendance, grades, paymentsResult] = await Promise.all([
      this.attendanceService.findByStudent(studentId),
      this.gradesService.findByStudent(studentId),
      this.paymentsService.findByStudent(studentId),
    ]);

    const averageGrade = this.gradesService.getAverageForStudent(grades);
    const attendanceRate = attendance.summary.attendanceRate;
    const financialStatus = paymentsResult.accountStatus;

    return {
      averageGrade,
      attendanceRate,
      financialStatus,
      attendance: attendance.summary,
      grades,
      payments: paymentsResult.payments,
    };
  }

  financeDashboard() {
    return this.financeService.getDashboardSummary();
  }
}
