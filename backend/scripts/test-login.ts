import { AuthService } from '../src/modules/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../src/modules/users/entities/user.entity';

async function main() {
  const plainPassword = 'Password123';
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const fakeUser = {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    password: passwordHash,
    role: UserRole.ADMIN,
    isActive: true,
    person: {
      id: 1,
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
    },
  };

  const usersService = {
    async findByUsername(username: string) {
      return username === fakeUser.username ? fakeUser : null;
    },
    async findById() {
      return fakeUser;
    },
  } as const;

  const personService = {
    async findByEmail() {
      return null;
    },
    async create() {
      return fakeUser.person;
    },
  } as const;

  const studentsService = {
    async create() {
      return null;
    },
    async findByUserId() {
      return null;
    },
  } as const;

  const teachersService = {
    async create() {
      return null;
    },
    async findByUserId() {
      return null;
    },
  } as const;

  const coursesService = {
    async findByTeacher() {
      return [];
    },
  } as const;

  const gradesService = {
    async findByStudent() {
      return [];
    },
  } as const;

  const jwtService = new JwtService({
    secret: 'test-secret',
    signOptions: { expiresIn: '12h' },
  });

  const authService = new AuthService(
    usersService as any,
    personService as any,
    jwtService,
    studentsService as any,
    teachersService as any,
    coursesService as any,
    gradesService as any,
  );

  const success = await authService.login({
    username: fakeUser.username,
    password: plainPassword,
  });

  console.log('Successful login response:', success);

  try {
    await authService.login({ username: fakeUser.username, password: 'WrongPass' });
  } catch (error) {
    console.log('Failed login message:', (error as Error).message);
  }
}

main().catch((error) => {
  console.error('Login test encountered an error:', error);
  process.exit(1);
});
