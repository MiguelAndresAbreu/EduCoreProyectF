import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Person } from './entities/person.entity';
import { PersonService } from './person.service';
import { PersonController } from './person.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Person]), forwardRef(() => UsersModule)],
  controllers: [PersonController],
  providers: [PersonService],
  exports: [PersonService, TypeOrmModule],
})
export class PersonModule {}
