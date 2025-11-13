import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PersonService } from '../person/person.service';
import { Person } from '../person/entities/person.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly personService: PersonService,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['person', 'student', 'teacher'],
    });
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['person', 'student', 'teacher'],
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .leftJoinAndSelect('user.person', 'person')
      .leftJoinAndSelect('user.student', 'student')
      .leftJoinAndSelect('user.teacher', 'teacher')
      .where('user.username = :username', { username })
      .getOne();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .leftJoinAndSelect('user.person', 'person')
      .where('user.email = :email', { email })
      .getOne();
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByUsername(createUserDto.username);
    if (existingUser) {
      throw new BadRequestException('El nombre de usuario ya está en uso');
    }

    const existingEmail = await this.findByEmail(createUserDto.email);
    if (existingEmail) {
      throw new BadRequestException('El correo ya está en uso');
    }

    const person = createUserDto.personId
      ? await this.personService.findOne(createUserDto.personId)
      : null;

    if (createUserDto.personId && !person) {
      throw new BadRequestException('La persona asociada no existe');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      username: createUserDto.username,
      email: createUserDto.email,
      password: passwordHash,
      role: createUserDto.role ?? UserRole.STUDENT,
      person: person ?? undefined,
    });

    return this.userRepository.save(user);
  }

  async createWithPerson(params: {
    username: string;
    email: string;
    password: string;
    role?: UserRole;
    person: Person;
  }): Promise<User> {
    const existingUser = await this.findByUsername(params.username);
    if (existingUser) {
      throw new BadRequestException('El nombre de usuario ya está en uso');
    }

    const existingEmail = await this.findByEmail(params.email);
    if (existingEmail) {
      throw new BadRequestException('El correo ya está en uso');
    }

    const passwordHash = await bcrypt.hash(params.password, 10);

    const user = this.userRepository.create({
      username: params.username,
      email: params.email,
      password: passwordHash,
      role: params.role ?? UserRole.STUDENT,
      person: params.person,
    });

    return this.userRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existing = await this.findByUsername(updateUserDto.username);
      if (existing && existing.id !== id) {
        throw new BadRequestException('El nombre de usuario ya está en uso');
      }
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.findByEmail(updateUserDto.email);
      if (existingEmail && existingEmail.id !== id) {
        throw new BadRequestException('El correo ya está en uso');
      }
    }

    let password = user.password;
    if (updateUserDto.password) {
      password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updated = await this.userRepository.save({
      ...user,
      ...updateUserDto,
      password,
    });

    return this.findById(updated.id);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
