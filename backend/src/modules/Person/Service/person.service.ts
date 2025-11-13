import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from '../../Person/Entity/person.entity';
import { CreatePersonInput } from '../../Person/Model/person.model';

@Injectable()
export class PersonService {
    constructor(
        @InjectRepository(Person)
        private personRepository: Repository<Person>,
    ) {}

    async findAll(): Promise<Person[]> {
        return this.personRepository.find();
    }

    async findOne(id: number): Promise<Person> {
        try {
            return await this.personRepository.findOneOrFail({ where: { id } });
        } catch {
            throw new NotFoundException(`Persona ${id} no encontrada`);
        }
    }

    async create(data: CreatePersonInput): Promise<Person> {
        const person = this.personRepository.create(data);
        return this.personRepository.save(person);
    }
}
