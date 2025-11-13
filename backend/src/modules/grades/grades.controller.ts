import { Body, Controller, ForbiddenException, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { GradesService } from './grades.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { StudentsService } from '../students/students.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('grades')
export class GradesController {
  constructor(
    private readonly gradesService: GradesService,
    private readonly studentsService: StudentsService,
  ) {}

  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Post()
  create(@Body() createGradeDto: CreateGradeDto, @CurrentUser() user: JwtPayload) {
    return this.gradesService.create(createGradeDto, user.sub);
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
        throw new ForbiddenException('No puedes ver calificaciones de otro estudiante');
      }
    }
    return this.gradesService.findByStudent(id);
  }
}
