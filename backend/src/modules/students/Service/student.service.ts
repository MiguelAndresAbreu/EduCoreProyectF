import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../Entity/student.entity';
import { User } from '../../User/Entity/user.entity';

@Injectable()
export class StudentService {
    constructor(
        @InjectRepository(Student)
        private readonly studentRepository: Repository<Student>,
    ) {}

    async findAll(): Promise<Student[]> {
        return this.studentRepository.find({ relations: ['user'] });
    }

    async findOne(id: number): Promise<Student> {
        const student = await this.studentRepository.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!student) throw new NotFoundException(`Estudiante con id ${id} no encontrado`);
        return student;
    }

    async create(studentData: Partial<Student>, user: User): Promise<Student> {
        const newStudent = this.studentRepository.create({ ...studentData, user });
        return this.studentRepository.save(newStudent);
    }

    async update(id: number, updateData: Partial<Student>): Promise<Student> {
        const student = await this.findOne(id);
        Object.assign(student, updateData);
        return this.studentRepository.save(student);
    }

    async remove(id: number): Promise<boolean> {
        const result = await this.studentRepository.delete(id);
        return !!result.affected && result.affected > 0;
    }
}
