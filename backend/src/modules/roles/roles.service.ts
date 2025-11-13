import { Injectable } from '@nestjs/common';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class RolesService {
  findAll() {
    return Object.values(UserRole);
  }
}
