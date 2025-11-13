import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './Entity/student.entity';
import { StudentService } from './Service/student.service';
import { StudentResolver } from './Resolver/student.resolver';
import { UserModule } from '../User/user.module';

@Module({
    imports: [TypeOrmModule.forFeature([Student]), UserModule],
    providers: [StudentService, StudentResolver],
})
export class StudentModule {}
