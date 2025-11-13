import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from './entities/person.entity';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

@Injectable()
export class PersonService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
  ) {}

  create(createPersonDto: CreatePersonDto): Promise<Person> {
    const person = this.personRepository.create(createPersonDto);
    return this.personRepository.save(person);
  }

  findByEmail(email: string): Promise<Person | null> {
    return this.personRepository.findOne({ where: { email } });
  }

  findOne(id: number): Promise<Person | null> {
    return this.personRepository.findOne({ where: { id } });
  }

  async update(id: number, updatePersonDto: UpdatePersonDto): Promise<Person> {
    const person = await this.personRepository.preload({ id, ...updatePersonDto });
    if (!person) {
      throw new NotFoundException('Persona no encontrada');
    }
    return this.personRepository.save(person);
  }
}
