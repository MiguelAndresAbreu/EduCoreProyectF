import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './Entity/user.entity';
import { UserService } from './Service/user.service';
import { UserResolver } from './Resolver/user.resolver';
import { PersonModule } from '../Person/person.module';

@Module({
    imports: [TypeOrmModule.forFeature([User]), PersonModule],
    providers: [UserService, UserResolver],
    exports: [UserService],
})
export class UserModule {}
