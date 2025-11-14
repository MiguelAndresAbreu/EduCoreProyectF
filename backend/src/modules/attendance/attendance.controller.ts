import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { TeachersService } from '../teachers/teachers.service';
import { StudentsService } from '../students/students.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly teachersService: TeachersService,
    private readonly studentsService: StudentsService,
  ) {}

  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Post()
  async create(
    @Body() createAttendanceDto: CreateAttendanceDto,
    @CurrentUser() user: JwtPayload,
  ) {
    if (user.role === UserRole.TEACHER) {
      const teacher = await this.teachersService.findByUserId(user.sub);
      if (!teacher) {
        throw new ForbiddenException('No autorizado para registrar asistencia');
      }
      createAttendanceDto.teacherId = teacher.id;
    }
    return this.attendanceService.registerAttendance(createAttendanceDto);
  }

  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @Get('course/:courseId')
  findByCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Query('date') date?: string,
  ) {
    return this.attendanceService.findByCourse(courseId, date);
  }

  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @Get('student/:studentId')
  async findByStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @CurrentUser() user: JwtPayload,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (user.role === UserRole.STUDENT) {
      const student = await this.studentsService.findByUserId(user.sub);
      if (!student || student.id !== studentId) {
        throw new ForbiddenException('No autorizado para ver asistencia de otro estudiante');
      }
    }

    return this.attendanceService.findByStudent(studentId, {
      startDate,
      endDate,
    });
  }

  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get('report')
  report(
    @Query('courseId') courseId?: string,
    @Query('studentId') studentId?: string,
    @Query('teacherId') teacherId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.attendanceService.getReport({
      courseId: courseId ? Number(courseId) : undefined,
      studentId: studentId ? Number(studentId) : undefined,
      teacherId: teacherId ? Number(teacherId) : undefined,
      startDate,
      endDate,
    });
  }
}
