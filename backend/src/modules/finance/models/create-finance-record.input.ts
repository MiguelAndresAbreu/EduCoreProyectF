import { Field, Float, InputType } from '@nestjs/graphql';
import { FinanceRecordType } from '../entities/finance-record.entity';

@InputType()
export class CreateFinanceRecordInput {
  @Field(() => FinanceRecordType)
  type: FinanceRecordType;

  @Field(() => Float)
  amount: number;

  @Field()
  concept: string;

  @Field()
  date: string;

  @Field({ nullable: true })
  notes?: string;
}
