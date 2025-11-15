import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { AuthPayloadModel } from '../models/auth.model';
import { LoginInput } from '../inputs/login.input';
import { RegisterInput } from '../inputs/register.input';
import { UserProfileModel } from '../../profile/models/user-profile.model';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import {JwtAuthGuard} from "@/common/guards/jwt-auth.guard";
import {CurrentUser} from "@/common/decorators/current-user.decorator";

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthPayloadModel)
  async login(@Args('input') input: LoginInput): Promise<AuthPayloadModel> {
    const result = await this.authService.login(input);
    return {
      accessToken: result.accessToken,
      user: UserProfileModel.fromProfile(result.user),
    };
  }

  @Mutation(() => AuthPayloadModel)
  async register(@Args('input') input: RegisterInput): Promise<AuthPayloadModel> {
    const result = await this.authService.register(input);
    return {
      accessToken: result.accessToken,
      user: UserProfileModel.fromProfile(result.user),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => UserProfileModel)
  async me(@CurrentUser() user: JwtPayload): Promise<UserProfileModel> {
    const profile = await this.authService.me(user.sub);
    return UserProfileModel.fromProfile(profile);
  }
}
