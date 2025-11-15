import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PersonModule } from '../person/person.module';
import { ProfileModule } from '../profile/profile.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthResolver } from './resolvers/auth.resolver';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecret',
      signOptions: { expiresIn: '12h' },
    }),
    UsersModule,
    PersonModule,
    forwardRef(() => ProfileModule),
  ],
  controllers: [],
  providers: [AuthService, JwtStrategy, AuthResolver],
  exports: [],
})
export class AuthModule {}
