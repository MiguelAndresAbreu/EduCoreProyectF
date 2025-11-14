import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Incident, IncidentStatus } from './entities/incident.entity';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { UserRole } from '../users/entities/user.entity';
import { StudentsService } from '../students/students.service';
import { TeachersService } from '../teachers/teachers.service';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(Incident)
    private readonly incidentRepository: Repository<Incident>,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
    private readonly studentsService: StudentsService,
    private readonly teachersService: TeachersService,
  ) {}

  async create(createIncidentDto: CreateIncidentDto) {
    const reporter = await this.usersService.findById(createIncidentDto.reporterId);
    const reported = await this.usersService.findById(createIncidentDto.reportedId);

    const incident = this.incidentRepository.create({
      reporter,
      reported,
      description: createIncidentDto.description,
      date: createIncidentDto.date,
      status: createIncidentDto.status ?? IncidentStatus.OPEN,
    });

    const saved = await this.incidentRepository.save(incident);
    await this.notifyStaff(saved);
    return saved;
  }

  async update(id: number, updateIncidentDto: UpdateIncidentDto) {
    const incident = await this.incidentRepository.findOne({ where: { id } });
    if (!incident) {
      throw new NotFoundException('Incidencia no encontrada');
    }

    if (updateIncidentDto.reporterId) {
      incident.reporter = await this.usersService.findById(updateIncidentDto.reporterId);
    }

    if (updateIncidentDto.reportedId) {
      incident.reported = await this.usersService.findById(updateIncidentDto.reportedId);
    }

    Object.assign(incident, {
      description: updateIncidentDto.description ?? incident.description,
      date: updateIncidentDto.date ?? incident.date,
      status: updateIncidentDto.status ?? incident.status,
    });

    const saved = await this.incidentRepository.save(incident);

    if (updateIncidentDto.status && updateIncidentDto.status !== IncidentStatus.OPEN) {
      await this.notifyStaff(saved, true);
    }

    return saved;
  }

  async findByStudent(studentId: number) {
    const student = await this.studentsService.findOne(studentId);
    const userId = student.user.id;

    return this.incidentRepository.find({
      where: [{ reporter: { id: userId } }, { reported: { id: userId } }],
      order: { createdAt: 'DESC' },
    });
  }

  async findByTeacher(teacherId: number) {
    const teacher = await this.teachersService.findOne(teacherId);
    const userId = teacher.user.id;

    return this.incidentRepository.find({
      where: [{ reporter: { id: userId } }, { reported: { id: userId } }],
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(filters?: { status?: IncidentStatus }) {
    const where: FindOptionsWhere<Incident> = {};
    if (filters?.status) {
      where.status = filters.status;
    }

    return this.incidentRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  private async notifyStaff(incident: Incident, isUpdate = false) {
    const staffUsers = await this.usersService.findByRoles([UserRole.ADMIN, UserRole.STAFF]);
    const recipientIds = staffUsers.map((user) => user.id);

    if (!recipientIds.length) {
      return;
    }

    const title = isUpdate ? 'Actualización de incidencia' : 'Nueva incidencia reportada';
    const message = `${incident.reporter?.person?.firstName ?? 'Usuario'} reportó a ${incident.reported?.person?.firstName ?? 'usuario'}: ${incident.description}`;

    await this.notificationsService.notifyMany({
      title,
      message,
      recipientIds,
      type: NotificationType.SYSTEM,
    });
  }
}
