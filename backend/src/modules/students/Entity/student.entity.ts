import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../../User/Entity/user.entity';

@ObjectType()
@Entity()
export class Student {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => String)
    @Column({ type: 'varchar', length: 50 })
    enrollmentNumber: string; // matrícula del estudiante

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 50, nullable: true })
    gradeLevel?: string; // nivel académico

    @Field(() => String, { nullable: true })
    @Column({ type: 'varchar', length: 50, nullable: true })
    section?: string;

    @Field(() => User)
    @OneToOne(() => User, (user) => user.student, { onDelete: 'CASCADE' })
    @JoinColumn()
    user: User;
}
