import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PersonModule } from '../person/person.module';
import { StudentsModule } from '../students/students.module';
import { TeachersModule } from '../teachers/teachers.module';
import { CoursesModule } from '../courses/courses.module';
import { GradesModule } from '../grades/grades.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecret',
      signOptions: { expiresIn: '12h' },
    }),
    UsersModule,
    PersonModule,
    StudentsModule,
    TeachersModule,
    CoursesModule,
    GradesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
