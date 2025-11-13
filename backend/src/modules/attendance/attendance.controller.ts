import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Post()
  create(
    @Body() createAttendanceDto: CreateAttendanceDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.attendanceService.registerAttendance(createAttendanceDto, user.sub);
  }

  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @Get('course/:courseId')
  findByCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Query('date') date?: string,
  ) {
    return this.attendanceService.findByCourse(courseId, date);
  }
}
