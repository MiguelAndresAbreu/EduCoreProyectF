import { Field, Float, InputType } from '@nestjs/graphql';
import { PaymentMethod, PaymentStatus } from '../entities/payment.entity';

@InputType()
export class CreatePaymentInput {
  @Field()
  studentId: number;

  @Field(() => Float)
  amount: number;

  @Field()
  concept: string;

  @Field()
  paymentDate: string;

  @Field(() => PaymentMethod)
  method: PaymentMethod;

  @Field(() => PaymentStatus)
  status: PaymentStatus;
}
