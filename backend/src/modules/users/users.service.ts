import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { CreateUserInput } from './inputs/create-user.input';
import { UpdateUserInput } from './inputs/update-user.input';
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

  async findForAuth(identifier: string): Promise<User | null> {
    const normalized = identifier.trim().toLowerCase();
    if (!normalized) {
      return null;
    }

    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .leftJoinAndSelect('user.person', 'person')
      .leftJoinAndSelect('user.student', 'student')
      .leftJoinAndSelect('user.teacher', 'teacher')
      .where('LOWER(user.username) = :username', { username: normalized })
      .orWhere('LOWER(user.email) = :email', { email: normalized })
      .getOne();
  }

  async findByIds(ids: number[]): Promise<User[]> {
    if (!ids.length) {
      return [];
    }
    return this.userRepository.find({
      where: { id: In(ids) },
      relations: ['person', 'student', 'teacher'],
    });
  }

  async findByRoles(roles: UserRole[]): Promise<User[]> {
    if (!roles.length) {
      return [];
    }
    return this.userRepository.find({
      where: { role: In(roles) },
      relations: ['person', 'student', 'teacher'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .leftJoinAndSelect('user.person', 'person')
      .where('user.email = :email', { email })
      .getOne();
  }

  async create(createUserInput: CreateUserInput): Promise<User> {
    const existingUser = await this.findByUsername(createUserInput.username);
    if (existingUser) {
      throw new BadRequestException('El nombre de usuario ya está en uso');
    }

    const existingEmail = await this.findByEmail(createUserInput.email);
    if (existingEmail) {
      throw new BadRequestException('El correo ya está en uso');
    }

    const person = createUserInput.personId
      ? await this.personService.findOne(createUserInput.personId)
      : null;

    if (createUserInput.personId && !person) {
      throw new BadRequestException('La persona asociada no existe');
    }

    const passwordHash = await bcrypt.hash(createUserInput.password, 10);

    const user = this.userRepository.create({
      username: createUserInput.username,
      email: createUserInput.email,
      password: passwordHash,
      role: createUserInput.role ?? UserRole.STUDENT,
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

  async update(id: number, updateUserInput: UpdateUserInput): Promise<User> {
    const user = await this.findById(id);

    if (updateUserInput.username && updateUserInput.username !== user.username) {
      const existing = await this.findByUsername(updateUserInput.username);
      if (existing && existing.id !== id) {
        throw new BadRequestException('El nombre de usuario ya está en uso');
      }
    }

    if (updateUserInput.email && updateUserInput.email !== user.email) {
      const existingEmail = await this.findByEmail(updateUserInput.email);
      if (existingEmail && existingEmail.id !== id) {
        throw new BadRequestException('El correo ya está en uso');
      }
    }

    let password = user.password;
    if (updateUserInput.password) {
      password = await bcrypt.hash(updateUserInput.password, 10);
    }

    const updated = await this.userRepository.save({
      ...user,
      ...updateUserInput,
      password,
    });

    return this.findById(updated.id);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
