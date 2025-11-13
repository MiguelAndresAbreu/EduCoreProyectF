import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UserService } from '../../User/Service/user.service';
import { UserModel } from '../../User/Model/user.model';
import { User, UserRole  } from '../../User/Entity/user.entity';
import { Person } from '../../Person/Entity/person.entity';


@Resolver(() => UserModel)
export class UserResolver {
    constructor(private readonly userService: UserService) {}

    @Query(() => [UserModel])
    users() {
        return this.userService.findAll();
    }

    @Query(() => UserModel)
    user(@Args('id', { type: () => Int }) id: number) {
        return this.userService.findById(id); // si no existe, NotFoundException
    }

    @Mutation(() => UserModel)
    async createUser(
        @Args('username') username: string,
        @Args('password') password: string,
        @Args('role', { type: () => UserRole }) role: UserRole,
        @Args('personId', { type: () => Int, nullable: true }) personId?: number,
    ): Promise<User> {
        const person = personId ? ({ id: personId } as Person) : undefined;
        return this.userService.create(username, password, role, person);
    }
}
