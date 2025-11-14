import { Field, Float, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { FinanceRecord, FinanceRecordType } from '../entities/finance-record.entity';

registerEnumType(FinanceRecordType, { name: 'FinanceRecordType' });

@ObjectType()
export class FinanceRecordModel {
  @Field(() => ID)
  id: number;

  @Field(() => FinanceRecordType)
  type: FinanceRecordType;

  @Field(() => Float)
  amount: number;

  @Field(() => String)
  concept: string;

  @Field(() => String)
  date: string;

  @Field(() => String, { nullable: true })
  notes?: string | null;

  @Field(() => Date)
  createdAt: Date;

  static fromEntity(entity: FinanceRecord): FinanceRecordModel {
    const model = new FinanceRecordModel();
    model.id = entity.id;
    model.type = entity.type;
    model.amount = Number(entity.amount);
    model.concept = entity.concept;
    model.date = entity.date;
    model.notes = entity.notes ?? null;
    model.createdAt = entity.createdAt;
    return model;
  }
}

@ObjectType()
export class FinanceTotalsModel {
  @Field(() => Float)
  income: number;

  @Field(() => Float)
  expense: number;

  @Field(() => Float)
  balance: number;
}

@ObjectType()
export class FinanceDashboardModel {
  @Field(() => FinanceTotalsModel)
  daily: FinanceTotalsModel;

  @Field(() => FinanceTotalsModel)
  weekly: FinanceTotalsModel;

  @Field(() => FinanceTotalsModel)
  monthly: FinanceTotalsModel;
}

@ObjectType()
export class FinanceOverviewModel {
  @Field(() => FinanceDashboardModel)
  dashboard: FinanceDashboardModel;

  @Field(() => FinanceTotalsModel)
  balance: FinanceTotalsModel;
}
