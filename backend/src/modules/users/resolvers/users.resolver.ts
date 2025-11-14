import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../users.service';
import { UserModel } from '../models/user.model';
import { CreateUserInput } from '../inputs/create-user.input';
import { UpdateUserInput } from '../inputs/update-user.input';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@Resolver(() => UserModel)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => UserModel)
  async createUser(@Args('input') input: CreateUserInput): Promise<UserModel> {
    const user = await this.usersService.create(input);
    const model = UserModel.fromEntity(user);
    if (!model) {
      throw new Error('No se pudo crear el usuario');
    }
    return model;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Query(() => [UserModel])
  async users(): Promise<UserModel[]> {
    const users = await this.usersService.findAll();
    return users
      .map((user) => UserModel.fromEntity(user))
      .filter((user): user is UserModel => !!user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Query(() => UserModel)
  async user(@Args('id', { type: () => Int }) id: number): Promise<UserModel> {
    const user = await this.usersService.findById(id);
    const model = UserModel.fromEntity(user);
    if (!model) {
      throw new Error('Usuario no encontrado');
    }
    return model;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => UserModel)
  async updateUser(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateUserInput,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<UserModel> {
    if (currentUser.role !== UserRole.ADMIN && currentUser.sub !== id) {
      throw new ForbiddenException('No puedes modificar otro usuario');
    }

    const payload: UpdateUserInput = {} as UpdateUserInput;

    if (currentUser.role === UserRole.ADMIN) {
      Object.assign(payload, input);
    } else {
      if (typeof input.email !== 'undefined') {
        payload.email = input.email;
      }
      if (typeof input.password !== 'undefined') {
        payload.password = input.password;
      }
    }

    const user = await this.usersService.update(id, payload);
    const model = UserModel.fromEntity(user);
    if (!model) {
      throw new Error('Usuario no encontrado');
    }
    return model;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Mutation(() => Boolean)
  async removeUser(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    await this.usersService.remove(id);
    return true;
  }
}
