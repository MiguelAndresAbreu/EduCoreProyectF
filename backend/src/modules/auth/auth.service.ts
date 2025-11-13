import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { PersonService } from '../person/person.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UserRole } from '../users/entities/user.entity';
import { StudentsService } from '../students/students.service';
import { TeachersService } from '../teachers/teachers.service';
import { CoursesService } from '../courses/courses.service';
import { GradesService } from '../grades/grades.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly personService: PersonService,
    private readonly jwtService: JwtService,
    private readonly studentsService: StudentsService,
    private readonly teachersService: TeachersService,
    private readonly coursesService: CoursesService,
    private readonly gradesService: GradesService,
  ) {}

  async register(registerDto: RegisterDto) {
    const personExists = await this.personService.findByEmail(registerDto.email);
    if (personExists) {
      throw new BadRequestException('El correo ya está registrado');
    }

    const person = await this.personService.create({
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      phone: registerDto.phone,
      address: registerDto.address,
      birthDate: registerDto.birthDate,
      avatar: registerDto.avatar,
    });

    const user = await this.usersService.createWithPerson({
      username: registerDto.username,
      email: registerDto.email,
      password: registerDto.password,
      role: registerDto.role ?? UserRole.STUDENT,
      person,
    });

    if (user.role === UserRole.STUDENT) {
      await this.studentsService.create({ userId: user.id });
    }

    if (user.role === UserRole.TEACHER) {
      await this.teachersService.create({ userId: user.id });
    }

    return this.buildAuthResponse(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByUsername(loginDto.username);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.buildAuthResponse(user);
  }

  async me(userId: number) {
    const user = await this.usersService.findById(userId);
    return this.buildProfile(user);
  }

  private async buildAuthResponse(user: any) {
    const payload: JwtPayload = { sub: user.id, username: user.username, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      user: await this.buildProfile(user),
    };
  }

  private async buildProfile(userOrId: any) {
    const user = typeof userOrId === 'number' ? await this.usersService.findById(userOrId) : userOrId;

    const profile: any = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      person: user.person,
    };

    if (user.role === UserRole.TEACHER) {
      const teacher = await this.teachersService.findByUserId(user.id);
      profile.teacher = teacher;
      profile.courses = teacher ? await this.coursesService.findByTeacher(teacher.id) : [];
    }

    if (user.role === UserRole.STUDENT) {
      const student = await this.studentsService.findByUserId(user.id);
      profile.student = student;
      profile.enrollments = student?.enrollments ?? [];
      if (student) {
        profile.grades = await this.gradesService.findByStudent(student.id);
      } else {
        profile.grades = [];
      }
    }

    return profile;
  }
}
