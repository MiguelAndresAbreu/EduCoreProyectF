import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { FinanceRecordType } from '../entities/finance-record.entity';

export class CreateFinanceRecordDto {
  @IsEnum(FinanceRecordType)
  type: FinanceRecordType;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  concept: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
