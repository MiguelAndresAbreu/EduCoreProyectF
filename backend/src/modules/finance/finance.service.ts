import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { FinanceRecord, FinanceRecordType } from './entities/finance-record.entity';
import { CreateFinanceRecordDto } from './dto/create-finance-record.dto';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(FinanceRecord)
    private readonly financeRepository: Repository<FinanceRecord>,
  ) {}

  create(createFinanceRecordDto: CreateFinanceRecordDto) {
    const record = this.financeRepository.create(createFinanceRecordDto);
    return this.financeRepository.save(record);
  }

  async getReport(options: { startDate?: string; endDate?: string }) {
    const where: any = {};

    if (options.startDate && options.endDate) {
      where.date = Between(options.startDate, options.endDate);
    }

    const records = await this.financeRepository.find({
      where,
      order: { date: 'DESC' },
    });

    return {
      records,
      totals: this.calculateTotals(records),
    };
  }

  async getBalance() {
    const records = await this.financeRepository.find();
    return this.calculateTotals(records);
  }

  async getDashboardSummary() {
    const today = new Date();
    const startOfDay = today.toISOString().split('T')[0];

    const startOfWeekDate = new Date(today);
    const day = startOfWeekDate.getDay();
    const diff = startOfWeekDate.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeekDate.setDate(diff);
    const startOfWeek = startOfWeekDate.toISOString().split('T')[0];

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split('T')[0];

    const [daily, weekly, monthly] = await Promise.all([
      this.getReport({ startDate: startOfDay, endDate: startOfDay }),
      this.getReport({ startDate: startOfWeek, endDate: startOfDay }),
      this.getReport({ startDate: startOfMonth, endDate: startOfDay }),
    ]);

    return {
      daily: daily.totals,
      weekly: weekly.totals,
      monthly: monthly.totals,
    };
  }

  private calculateTotals(records: FinanceRecord[]) {
    const totals = records.reduce(
      (acc, record) => {
        if (record.type === FinanceRecordType.INCOME) {
          acc.income += Number(record.amount);
        } else {
          acc.expense += Number(record.amount);
        }
        return acc;
      },
      { income: 0, expense: 0 },
    );

    return {
      income: Number(totals.income.toFixed(2)),
      expense: Number(totals.expense.toFixed(2)),
      balance: Number((totals.income - totals.expense).toFixed(2)),
    };
  }
}
