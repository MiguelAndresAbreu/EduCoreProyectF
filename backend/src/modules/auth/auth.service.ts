import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { PersonService } from '../person/person.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UserRole } from '../users/entities/user.entity';
import { ProfileService } from '../profile/profile.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly personService: PersonService,
    private readonly jwtService: JwtService,
    private readonly profileService: ProfileService,
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

    await this.profileService.ensureProfile(user);

    return this.buildAuthResponse(user.id);
  }

  async login(loginDto: LoginDto) {
    const identifier = loginDto.identifier?.trim() ?? '';
    if (!identifier) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const user = await this.usersService.findForAuth(identifier);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.buildAuthResponse(user.id);
  }

  async me(userId: number) {
    const user = await this.usersService.findById(userId);
    return this.profileService.buildProfile(user);
  }

  private async buildAuthResponse(userId: number) {
    const user = await this.usersService.findById(userId);
    const payload: JwtPayload = { sub: user.id, username: user.username, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      user: await this.profileService.buildProfile(user),
    };
  }
}
