import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { StudentService } from '../Service/student.service';
import { StudentModel } from '../Model/student.model';
import { Student } from '../Entity/student.entity';
import { User } from '../../User/Entity/user.entity';

@Resolver(() => StudentModel)
export class StudentResolver {
    constructor(private readonly studentService: StudentService) {}

    @Query(() => [StudentModel])
    async students(): Promise<Student[]> {
        return this.studentService.findAll();
    }

    @Query(() => StudentModel)
    async student(@Args('id', { type: () => Int }) id: number): Promise<Student> {
        return this.studentService.findOne(id);
    }

    @Mutation(() => StudentModel)
    async createStudent(
        @Args('enrollmentNumber', { type: () => String }) enrollmentNumber: string,
        @Args('userId', { type: () => Int }) userId: number,
        @Args('gradeLevel', { type: () => String, nullable: true, required: false }) gradeLevel?: string,
        @Args('section', { type: () => String, nullable: true, required: false }) section?: string,
    ): Promise<Student> {
        const user = { id: userId } as User;
        return this.studentService.create({ enrollmentNumber, gradeLevel, section }, user);
    }

    @Mutation(() => StudentModel)
    async updateStudent(
        @Args('id', { type: () => Int }) id: number,
        @Args('gradeLevel', { type: () => String, nullable: true, required: false }) gradeLevel?: string,
        @Args('section', { type: () => String, nullable: true, required: false }) section?: string,
    ): Promise<Student> {
        return this.studentService.update(id, { gradeLevel, section });
    }

    @Mutation(() => Boolean)
    async removeStudent(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
        return this.studentService.remove(id);
    }
}
