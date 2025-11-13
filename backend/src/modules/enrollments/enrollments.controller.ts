import { Body, Controller, Delete, Param, ParseIntPipe, Post, Get, UseGuards, ForbiddenException } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { StudentsService } from '../students/students.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(
    private readonly enrollmentsService: EnrollmentsService,
    private readonly studentsService: StudentsService,
  ) {}

  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.TEACHER)
  @Post()
  create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(createEnrollmentDto);
  }

  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @Get('student/:id')
  async findByStudent(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    if (user.role === UserRole.STUDENT) {
      const student = await this.studentsService.findByUserId(user.sub);
      if (!student || student.id !== id) {
        throw new ForbiddenException('No puedes ver inscripciones de otro estudiante');
      }
    }
    return this.enrollmentsService.findByStudentId(id);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.remove(id);
  }
}
