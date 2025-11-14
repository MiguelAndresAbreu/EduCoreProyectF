import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from './entities/person.entity';
import { PersonService } from './person.service';
import { UsersModule } from '../users/users.module';
import { PersonResolver } from './resolvers/person.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Person]), forwardRef(() => UsersModule)],
  providers: [PersonService, PersonResolver],
  exports: [PersonService, TypeOrmModule],
})
export class PersonModule {}
