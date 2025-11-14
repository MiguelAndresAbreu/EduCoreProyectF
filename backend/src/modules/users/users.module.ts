import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { PersonModule } from '../person/person.module';
import { UsersResolver } from './resolvers/users.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => PersonModule)],
  controllers: [UsersController],
  providers: [UsersService, UsersResolver],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
