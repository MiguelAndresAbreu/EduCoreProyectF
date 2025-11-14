import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { PersonModel } from '../models/person.model';
import { PersonService } from '../person.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { UsersService } from '../../users/users.service';
import { UserRole } from '../../users/entities/user.entity';
import { UpdatePersonInput } from '../inputs/update-person.input';

@Resolver(() => PersonModel)
export class PersonResolver {
  constructor(
    private readonly personService: PersonService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => PersonModel, { nullable: true })
  async person(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<PersonModel | null> {
    const currentUser = await this.usersService.findById(user.sub);
    if (currentUser.role !== UserRole.ADMIN && currentUser.person?.id !== id) {
      throw new ForbiddenException('No puedes consultar otra persona');
    }

    return PersonModel.fromEntity(await this.personService.findOne(id));
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => PersonModel)
  async updatePerson(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdatePersonInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<PersonModel> {
    const currentUser = await this.usersService.findById(user.sub);
    if (currentUser.role !== UserRole.ADMIN && currentUser.person?.id !== id) {
      throw new ForbiddenException('No puedes modificar otra persona');
    }

    const person = await this.personService.update(id, input);
    const model = PersonModel.fromEntity(person);
    if (!model) {
      throw new Error('Persona no encontrada');
    }

    return model;
  }
}
