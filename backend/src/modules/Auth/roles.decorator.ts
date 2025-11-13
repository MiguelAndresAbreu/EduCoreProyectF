// src/auth/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../User/Entity/user.entity';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
