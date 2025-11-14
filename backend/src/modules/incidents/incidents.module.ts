import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Incident } from './entities/incident.entity';
import { IncidentsService } from './incidents.service';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { StudentsModule } from '../students/students.module';
import { TeachersModule } from '../teachers/teachers.module';
import { IncidentsResolver } from './resolvers/incidents.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([Incident]),
    UsersModule,
    NotificationsModule,
    StudentsModule,
    TeachersModule,
  ],
  controllers: [],
  providers: [IncidentsService, IncidentsResolver],
  exports: [IncidentsService],
})
export class IncidentsModule {}
