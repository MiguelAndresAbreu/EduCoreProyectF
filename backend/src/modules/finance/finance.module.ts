import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceRecord } from './entities/finance-record.entity';
import { FinanceService } from './finance.service';
import { FinanceResolver } from './resolvers/finance.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([FinanceRecord])],
  controllers: [],
  providers: [FinanceService, FinanceResolver],
  exports: [FinanceService],
})
export class FinanceModule {}
