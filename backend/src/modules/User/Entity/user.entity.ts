import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Person } from '../../Person/Entity/person.entity';
import { Student } from '../../students/Entity/student.entity'
import { registerEnumType, Field } from '@nestjs/graphql';


export enum UserRole {
    ADMIN = 'ADMIN',
    TEACHER = 'TEACHER',
    ADMINISTRATIVE = 'ADMINISTRATIVE',
    STUDENT = 'STUDENT',
}

registerEnumType(UserRole, { name: 'UserRole' });

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, unique: true })
    username: string;

    @Column({ type: 'varchar', length: 255 })
    password: string;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @OneToOne(() => Person, (person) => person.user, { cascade: true })
    @JoinColumn()
    person: Person;

    @OneToOne(() => Student, (student) => student.user)
    student: Student;

    @Field(() => UserRole)
    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.STUDENT, // Por defecto si se registra desde frontend
    })
    role: UserRole;
}
