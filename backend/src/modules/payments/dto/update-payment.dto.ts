import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentDto } from './create-payment.dto';
import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../entities/payment.entity';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {
  @IsOptional()
  @IsInt()
  studentId?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @IsOptional()
  @IsString()
  concept?: string;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
}
