import { Field, Float, InputType, Int } from '@nestjs/graphql';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../entities/payment.entity';

@InputType()
export class CreatePaymentInput {
  @Field(() => Int)
  @IsNumber()
  studentId: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  amount: number;

  @Field(() => String)
  @IsString()
  concept: string;

  @Field(() => String)
  @IsDateString()
  paymentDate: string;

  @Field(() => PaymentMethod)
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @Field(() => PaymentStatus)
  @IsEnum(PaymentStatus)
  status: PaymentStatus;
}

@InputType()
export class UpdatePaymentInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  studentId?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  concept?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @Field(() => PaymentMethod, { nullable: true })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @Field(() => PaymentStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
}
