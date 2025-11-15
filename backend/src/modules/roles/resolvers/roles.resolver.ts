import { Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { RolesService } from '../roles.service';
import { UserRole } from '../../users/entities/user.entity';
import {RolesGuard} from "@/common/guards/roles.guard";
import {JwtAuthGuard} from "@/common/guards/jwt-auth.guard";
import {Roles} from "@/common/decorators/roles.decorator";

@Resolver()
export class RolesResolver {
  constructor(private readonly rolesService: RolesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Query(() => [UserRole])
  roles(): UserRole[] {
    return this.rolesService.findAll();
  }
}
