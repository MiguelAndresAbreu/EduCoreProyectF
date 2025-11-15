import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { FinanceService } from '../finance.service';
import {
  FinanceOverviewModel,
  FinanceRecordModel,
} from '../models/finance-record.model';
import { CreateFinanceRecordInput } from '../inputs/create-finance-record.input';

import { UserRole } from '../../users/entities/user.entity';
import {JwtAuthGuard} from "@/common/guards/jwt-auth.guard";
import {RolesGuard} from "@/common/guards/roles.guard";
import {Roles} from "@/common/decorators/roles.decorator";

@Resolver(() => FinanceRecordModel)
export class FinanceResolver {
  constructor(private readonly financeService: FinanceService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  @Query(() => FinanceOverviewModel)
  async financeOverview(): Promise<FinanceOverviewModel> {
    const [dashboard, balance] = await Promise.all([
      this.financeService.getDashboardSummary(),
      this.financeService.getBalance(),
    ]);

    return {
      dashboard: {
        daily: { ...dashboard.daily },
        weekly: { ...dashboard.weekly },
        monthly: { ...dashboard.monthly },
      },
      balance: { ...balance },
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  @Mutation(() => FinanceRecordModel)
  async createFinanceRecord(
    @Args('input') input: CreateFinanceRecordInput,
  ): Promise<FinanceRecordModel> {
    const record = await this.financeService.create(input);
    return FinanceRecordModel.fromEntity(record);
  }
}
