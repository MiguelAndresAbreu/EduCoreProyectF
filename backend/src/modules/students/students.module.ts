import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { StudentsService } from './students.service';
import { UsersModule } from '../users/users.module';
import { StudentsResolver } from './resolvers/students.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Student]), UsersModule],
  providers: [StudentsService, StudentsResolver],
  exports: [StudentsService],
})
export class StudentsModule {}
