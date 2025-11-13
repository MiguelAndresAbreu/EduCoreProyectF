import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateFinanceRecordDto } from './dto/create-finance-record.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  @Post()
  create(@Body() createFinanceRecordDto: CreateFinanceRecordDto) {
    return this.financeService.create(createFinanceRecordDto);
  }

  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  @Get('report')
  report(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.financeService.getReport({ startDate, endDate });
  }

  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  @Get('balance')
  balance() {
    return this.financeService.getBalance();
  }

  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  @Get('dashboard')
  dashboard() {
    return this.financeService.getDashboardSummary();
  }
}
