import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { PersonService } from '../../person/person.service';
import { UsersService } from '../../users/users.service';
import { ProfileService } from '../profile.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { UpdateProfileInput } from '../models/update-profile.input';
import { UserProfileModel } from '../models/user-profile.model';
import { UserRole } from '../../users/entities/user.entity';

@Resolver(() => UserProfileModel)
export class ProfileResolver {
  constructor(
    private readonly personService: PersonService,
    private readonly usersService: UsersService,
    private readonly profileService: ProfileService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => UserProfileModel)
  async updateProfile(
    @Args('personId', { type: () => Int }) personId: number,
    @Args('userId', { type: () => Int }) userId: number,
    @Args('input') input: UpdateProfileInput,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<UserProfileModel> {
    if (currentUser.role !== UserRole.ADMIN && currentUser.sub !== userId) {
      throw new ForbiddenException('No puedes modificar otro usuario');
    }

    await this.personService.update(personId, input.person);

    if (input.user) {
      await this.usersService.update(userId, input.user);
    }

    const updatedUser = await this.usersService.findById(userId);
    const profile = await this.profileService.buildProfile(updatedUser);
    return UserProfileModel.fromProfile(profile);
  }
}
