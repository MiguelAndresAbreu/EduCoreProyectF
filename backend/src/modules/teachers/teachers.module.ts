import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from './entities/teacher.entity';
import { TeachersService } from './teachers.service';
import { UsersModule } from '../users/users.module';
import { TeachersResolver } from './resolvers/teachers.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Teacher]), UsersModule],
  providers: [TeachersService, TeachersResolver],
  exports: [TeachersService],
})
export class TeachersModule {}
