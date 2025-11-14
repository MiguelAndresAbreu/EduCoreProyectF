import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsService } from './notifications.service';
import { UsersModule } from '../users/users.module';
import { NotificationsResolver } from './resolvers/notifications.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), UsersModule],
  controllers: [],
  providers: [NotificationsService, NotificationsResolver],
  exports: [NotificationsService],
})
export class NotificationsModule {}
