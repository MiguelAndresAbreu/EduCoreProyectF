import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from './Entity/person.entity';
import { PersonService } from './Service/person.service';
import { PersonResolver } from './Resolver/person.resolver';

@Module({
    imports: [TypeOrmModule.forFeature([Person])],
    providers: [PersonService, PersonResolver],
    exports: [PersonService],
})
export class PersonModule {}
