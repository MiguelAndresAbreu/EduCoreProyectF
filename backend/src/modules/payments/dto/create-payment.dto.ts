import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsInt()
  studentId: number;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  concept: string;

  @IsDateString()
  paymentDate: string;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsEnum(PaymentStatus)
  status: PaymentStatus;
}
