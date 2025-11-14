import { Field, Float, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Payment, PaymentMethod, PaymentStatus } from '../entities/payment.entity';
import { StudentModel } from '../../students/models/student.model';

registerEnumType(PaymentStatus, { name: 'PaymentStatus' });
registerEnumType(PaymentMethod, { name: 'PaymentMethod' });

@ObjectType()
export class PaymentModel {
  @Field(() => ID)
  id: number;

  @Field(() => StudentModel)
  student: StudentModel;

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

  @Field(() => Date)
  createdAt: Date;

  static fromEntity(entity: Payment): PaymentModel {
    const model = new PaymentModel();
    model.id = entity.id;
    const student = StudentModel.fromEntity(entity.student);
    if (!student) {
      throw new Error('Payment entity is missing student relation');
    }
    model.student = student;
    model.amount = Number(entity.amount);
    model.concept = entity.concept;
    model.paymentDate = entity.paymentDate;
    model.method = entity.method;
    model.status = entity.status;
    model.createdAt = entity.createdAt;
    return model;
  }
}

@ObjectType()
export class PaymentsTotalsModel {
  @Field(() => Float)
  paid: number;

  @Field(() => Float)
  pending: number;

  @Field(() => Float)
  balance: number;
}

@ObjectType()
export class StudentPaymentsModel {
  @Field(() => [PaymentModel])
  payments: PaymentModel[];

  @Field(() => PaymentsTotalsModel)
  accountStatus: PaymentsTotalsModel;
}
