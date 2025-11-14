import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from './entities/person.entity';
import { CreatePersonInput } from './inputs/create-person.input';
import { UpdatePersonInput } from './inputs/update-person.input';

@Injectable()
export class PersonService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
  ) {}

  create(createPersonInput: CreatePersonInput): Promise<Person> {
    const person = this.personRepository.create(createPersonInput);
    return this.personRepository.save(person);
  }

  findByEmail(email: string): Promise<Person | null> {
    return this.personRepository.findOne({ where: { email } });
  }

  findOne(id: number): Promise<Person | null> {
    return this.personRepository.findOne({ where: { id } });
  }

  async update(id: number, updatePersonInput: UpdatePersonInput): Promise<Person> {
    const person = await this.personRepository.preload({ id, ...updatePersonInput });
    if (!person) {
      throw new NotFoundException('Persona no encontrada');
    }
    return this.personRepository.save(person);
  }
}
