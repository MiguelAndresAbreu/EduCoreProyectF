import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../User/Entity/user.entity';
import { Person } from '../../Person/Entity/person.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async findAll(): Promise<User[]> {
        return this.userRepository.find({ relations: ['person'] });
    }

    async findById(id: number): Promise<User | null> {
        return this.userRepository.findOne({
            where: { id },
            relations: ['person'],
        });
    }

    async create(
        username: string,
        password: string,
        role: UserRole,
        person?: Person,
    ): Promise<User> {
        const user = this.userRepository.create({
            username,
            password,
            role,
            person,
        });
        return this.userRepository.save(user);
    }
}
