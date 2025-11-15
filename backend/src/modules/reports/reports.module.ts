import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AttendanceModule } from '../attendance/attendance.module';
import { GradesModule } from '../grades/grades.module';
import { PaymentsModule } from '../payments/payments.module';
import { FinanceModule } from '../finance/finance.module';
import { ReportsResolver } from './resolvers/reports.resolver';
import {StudentsModule} from "@/modules/students/students.module";

@Module({
  imports: [
    AttendanceModule,
    GradesModule,
    PaymentsModule,
    FinanceModule,
    StudentsModule,
  ],
  controllers: [],
  providers: [ReportsService, ReportsResolver],
})
export class ReportsModule {}{}
