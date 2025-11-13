import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ForbiddenException } from '@nestjs/common';
import { StudentsService } from '../students/students.service';
import { TeachersService } from '../teachers/teachers.service';
import { IncidentStatus } from './entities/incident.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('incidents')
export class IncidentsController {
  constructor(
    private readonly incidentsService: IncidentsService,
    private readonly studentsService: StudentsService,
    private readonly teachersService: TeachersService,
  ) {}

  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @Post()
  async create(@Body() createIncidentDto: CreateIncidentDto, @CurrentUser() user: JwtPayload) {
    if (user.role === UserRole.STUDENT || user.role === UserRole.TEACHER) {
      createIncidentDto.reporterId = user.sub;
    }
    return this.incidentsService.create(createIncidentDto);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Get()
  findAll(@Query('status') status?: IncidentStatus) {
    return this.incidentsService.findAll({ status });
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.STUDENT)
  @Get('student/:id')
  async findByStudent(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    if (user.role === UserRole.STUDENT) {
      const student = await this.studentsService.findByUserId(user.sub);
      if (!student || student.id !== id) {
        throw new ForbiddenException('No puedes ver las incidencias de otro estudiante');
      }
    }
    return this.incidentsService.findByStudent(id);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.TEACHER)
  @Get('teacher/:id')
  async findByTeacher(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    if (user.role === UserRole.TEACHER) {
      const teacher = await this.teachersService.findByUserId(user.sub);
      if (!teacher || teacher.id !== id) {
        throw new ForbiddenException('No puedes ver las incidencias de otro docente');
      }
    }
    return this.incidentsService.findByTeacher(id);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateIncidentDto: UpdateIncidentDto) {
    return this.incidentsService.update(id, updateIncidentDto);
  }
}
