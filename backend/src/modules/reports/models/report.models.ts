import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import {AttendanceModel, AttendanceSummaryModel} from '../../attendance/models/attendance.model';
import { GradeModel } from '../../grades/models/grade.model';
import {PaymentModel, PaymentsTotalsModel} from "@/modules/payments/models/payment.model";

@ObjectType()
export class AttendanceReportModel {
  @Field(() => [AttendanceModel])
  records: AttendanceModel[];

  @Field(() => AttendanceSummaryModel)
  summary: AttendanceSummaryModel;
}

@ObjectType()
export class StudentAverageModel {
  @Field(() => ID)
  studentId: number;

  @Field(() => Float)
  average: number;
}

@ObjectType()
export class GradesReportModel {
  @Field(() => [GradeModel])
  data: GradeModel[];

  @Field(() => Float)
  average: number;

  @Field(() => [StudentAverageModel])
  averagesByStudent: StudentAverageModel[];
}

@ObjectType()
export class PaymentsReportModel {
  @Field(() => [PaymentModel])
  payments: PaymentModel[];

  @Field(() => PaymentsTotalsModel)
  totals: PaymentsTotalsModel;
}

@ObjectType()
export class PerformanceReportModel {
  @Field(() => Float)
  averageGrade: number;

  @Field(() => Float)
  attendanceRate: number;

  @Field(() => PaymentsTotalsModel)
  financialStatus: PaymentsTotalsModel;

  @Field(() => AttendanceSummaryModel)
  attendance: AttendanceSummaryModel;

  @Field(() => [GradeModel])
  grades: GradeModel[];

  @Field(() => [PaymentModel])
  payments: PaymentModel[];
}
