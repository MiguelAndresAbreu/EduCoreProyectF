import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from './entities/subject.entity';
import { CreateSubjectInput } from './inputs/create-subject.input';
import { UpdateSubjectInput } from './inputs/update-subject.input';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
  ) {}

  findAll() {
    return this.subjectRepository.find();
  }

  async findOne(id: number) {
    const subject = await this.subjectRepository.findOne({ where: { id } });
    if (!subject) {
      throw new NotFoundException('Asignatura no encontrada');
    }
    return subject;
  }

  async create(createSubjectInput: CreateSubjectInput) {
    const existing = await this.subjectRepository.findOne({
      where: { code: createSubjectInput.code },
    });
    if (existing) {
      throw new BadRequestException('El código de la asignatura ya existe');
    }

    const subject = this.subjectRepository.create(createSubjectInput);
    return this.subjectRepository.save(subject);
  }

  async update(id: number, updateSubjectInput: UpdateSubjectInput) {
    const subject = await this.subjectRepository.preload({ id, ...updateSubjectInput });
    if (!subject) {
      throw new NotFoundException('Asignatura no encontrada');
    }
    return this.subjectRepository.save(subject);
  }

  async remove(id: number) {
    await this.subjectRepository.delete(id);
  }
}
