import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get('attendance')
  attendance(
    @Query('courseId') courseId?: string,
    @Query('studentId') studentId?: string,
    @Query('teacherId') teacherId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.attendanceReport({
      courseId: courseId ? Number(courseId) : undefined,
      studentId: studentId ? Number(studentId) : undefined,
      teacherId: teacherId ? Number(teacherId) : undefined,
      startDate,
      endDate,
    });
  }

  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get('grades')
  grades(
    @Query('courseId') courseId?: string,
    @Query('studentId') studentId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.gradesReport({
      courseId: courseId ? Number(courseId) : undefined,
      studentId: studentId ? Number(studentId) : undefined,
      startDate,
      endDate,
    });
  }

  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  @Get('payments')
  payments(@Query('studentId') studentId?: string, @Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.reportsService.paymentsReport({
      studentId: studentId ? Number(studentId) : undefined,
      startDate,
      endDate,
    });
  }

  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @Get('student/:id/performance')
  studentPerformance(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.academicPerformanceSummary(id);
  }

  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  @Get('finance/dashboard')
  financeDashboard() {
    return this.reportsService.financeDashboard();
  }
}
