import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GradesService } from './grades.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { StudentsService } from '../students/students.service';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { TeachersService } from '../teachers/teachers.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('grades')
export class GradesController {
  constructor(
    private readonly gradesService: GradesService,
    private readonly studentsService: StudentsService,
    private readonly teachersService: TeachersService,
  ) {}

  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Post()
  async create(@Body() createGradeDto: CreateGradeDto, @CurrentUser() user: JwtPayload) {
    if (user.role === UserRole.TEACHER) {
      const teacher = await this.teachersService.findByUserId(user.sub);
      createGradeDto.teacherId = teacher.id;
    }
    return this.gradesService.create(createGradeDto);
  }

  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateGradeDto: UpdateGradeDto) {
    return this.gradesService.update(id, updateGradeDto);
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

  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get('course/:id')
  findByCourse(@Param('id', ParseIntPipe) id: number) {
    return this.gradesService.findByCourse(id);
  }

  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get('report')
  report(
    @Query('courseId') courseId?: string,
    @Query('studentId') studentId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.gradesService.report({
      courseId: courseId ? Number(courseId) : undefined,
      studentId: studentId ? Number(studentId) : undefined,
      startDate,
      endDate,
    });
  }
}
