import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentsService } from './payments.service';
import { StudentsModule } from '../students/students.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsResolver } from './resolvers/payments.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), StudentsModule, NotificationsModule],
  controllers: [],
  providers: [PaymentsService, PaymentsResolver],
  exports: [PaymentsService],
})
export class PaymentsModule {}
