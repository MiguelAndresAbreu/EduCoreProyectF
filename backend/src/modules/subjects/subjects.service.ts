import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from './entities/subject.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

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

  async create(createSubjectDto: CreateSubjectDto) {
    const existing = await this.subjectRepository.findOne({
      where: { code: createSubjectDto.code },
    });
    if (existing) {
      throw new BadRequestException('El código de la asignatura ya existe');
    }

    const subject = this.subjectRepository.create(createSubjectDto);
    return this.subjectRepository.save(subject);
  }

  async update(id: number, updateSubjectDto: UpdateSubjectDto) {
    const subject = await this.subjectRepository.preload({ id, ...updateSubjectDto });
    if (!subject) {
      throw new NotFoundException('Asignatura no encontrada');
    }
    return this.subjectRepository.save(subject);
  }

  async remove(id: number) {
    await this.subjectRepository.delete(id);
  }
}
