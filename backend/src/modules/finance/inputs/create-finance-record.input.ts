import { Field, Float, InputType } from '@nestjs/graphql';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { FinanceRecordType } from '../entities/finance-record.entity';

@InputType()
export class CreateFinanceRecordInput {
  @Field(() => FinanceRecordType)
  @IsEnum(FinanceRecordType)
  type: FinanceRecordType;

  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  amount: number;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  concept: string;

  @Field(() => String)
  @IsDateString()
  date: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}
