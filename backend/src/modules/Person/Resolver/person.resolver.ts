import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PersonService } from '../../Person/Service/person.service';
import { PersonModel, CreatePersonInput } from '../../Person/Model/person.model';
import { Person } from '../../Person/Entity/person.entity';

@Resolver(() => PersonModel)
export class PersonResolver {
    constructor(private readonly personService: PersonService) {}

    @Query(() => [PersonModel])
    async persons(): Promise<Person[]> {
        return this.personService.findAll();
    }

    @Query(() => PersonModel, { nullable: true })
    async person(@Args('id', { type: () => Int }) id: number): Promise<Person> {
        return this.personService.findOne(id);
    }

    @Mutation(() => PersonModel)
    async createPerson(@Args('data', { type: () => CreatePersonInput }) data: CreatePersonInput): Promise<Person> {
        return this.personService.create(data);
    }
}
