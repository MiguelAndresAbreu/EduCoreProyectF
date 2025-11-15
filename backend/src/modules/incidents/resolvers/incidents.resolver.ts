import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import { IncidentsService } from '../incidents.service';
import { IncidentModel } from '../models/incident.model';
import { CreateIncidentInput, UpdateIncidentInput } from '../inputs/incident.input';
import { UserRole } from '../../users/entities/user.entity';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { IncidentStatus } from '../entities/incident.entity';
import { StudentsService } from '../../students/students.service';
import { TeachersService } from '../../teachers/teachers.service';
import {JwtAuthGuard} from "@/common/guards/jwt-auth.guard";
import {RolesGuard} from "@/common/guards/roles.guard";
import {Roles} from "@/common/decorators/roles.decorator";
import {CurrentUser} from "@/common/decorators/current-user.decorator";

@Resolver(() => IncidentModel)
export class IncidentsResolver {
  constructor(
    private readonly incidentsService: IncidentsService,
    private readonly studentsService: StudentsService,
    private readonly teachersService: TeachersService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  @Mutation(() => IncidentModel)
  async createIncident(
    @Args('input') input: CreateIncidentInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<IncidentModel> {
    const payload = { ...input };
    if (user.role === UserRole.STUDENT || user.role === UserRole.TEACHER) {
      payload.reporterId = user.sub;
    }
    const incident = await this.incidentsService.create(payload);
    return IncidentModel.fromEntity(incident);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Query(() => [IncidentModel])
  async incidents(
    @Args('status', { type: () => IncidentStatus, nullable: true }) status?: IncidentStatus,
  ): Promise<IncidentModel[]> {
    const incidents = await this.incidentsService.findAll({ status });
    return incidents.map((incident) => IncidentModel.fromEntity(incident));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.STUDENT)
  @Query(() => [IncidentModel])
  async incidentsByStudent(
    @Args('studentId', { type: () => Int }) studentId: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<IncidentModel[]> {
    if (user.role === UserRole.STUDENT) {
      const student = await this.studentsService.findByUserId(user.sub);
      if (!student || student.id !== studentId) {
        throw new ForbiddenException('No puedes ver las incidencias de otro estudiante');
      }
    }
    const incidents = await this.incidentsService.findByStudent(studentId);
    return incidents.map((incident) => IncidentModel.fromEntity(incident));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.TEACHER)
  @Query(() => [IncidentModel])
  async incidentsByTeacher(
    @Args('teacherId', { type: () => Int }) teacherId: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<IncidentModel[]> {
    if (user.role === UserRole.TEACHER) {
      const teacher = await this.teachersService.findByUserId(user.sub);
      if (!teacher || teacher.id !== teacherId) {
        throw new ForbiddenException('No puedes ver las incidencias de otro docente');
      }
    }
    const incidents = await this.incidentsService.findByTeacher(teacherId);
    return incidents.map((incident) => IncidentModel.fromEntity(incident));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Mutation(() => IncidentModel)
  async updateIncident(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateIncidentInput,
  ): Promise<IncidentModel> {
    const incident = await this.incidentsService.update(id, input);
    return IncidentModel.fromEntity(incident);
  }
}
