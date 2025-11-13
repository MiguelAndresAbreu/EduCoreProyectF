import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PersonModule } from './modules/person/person.module';
import { RolesModule } from './modules/roles/roles.module';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { CoursesModule } from './modules/courses/courses.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { GradesModule } from './modules/grades/grades.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '12345678',
      database: process.env.DB_NAME || 'educore',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    AuthModule,
    UsersModule,
    PersonModule,
    RolesModule,
    StudentsModule,
    TeachersModule,
    SubjectsModule,
    CoursesModule,
    EnrollmentsModule,
    AttendanceModule,
    GradesModule,
  ],
})
export class AppModule {}
