import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import { PaymentsService } from '../payments.service';
import { PaymentModel, PaymentsTotalsModel, StudentPaymentsModel } from '../models/payment.model';
import { CreatePaymentInput, UpdatePaymentInput } from '../inputs/payment.input';
import { UserRole } from '../../users/entities/user.entity';
import { StudentsService } from '../../students/students.service';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import {JwtAuthGuard} from "@/common/guards/jwt-auth.guard";
import {RolesGuard} from "@/common/guards/roles.guard";
import {Roles} from "@/common/decorators/roles.decorator";
import {CurrentUser} from "@/common/decorators/current-user.decorator";

@Resolver(() => PaymentModel)
export class PaymentsResolver {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly studentsService: StudentsService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.FINANCE, UserRole.STAFF, UserRole.STUDENT)
  @Query(() => StudentPaymentsModel)
  async paymentsByStudent(
    @Args('studentId', { type: () => Int }) studentId: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<StudentPaymentsModel> {
    if (user.role === UserRole.STUDENT) {
      const student = await this.studentsService.findByUserId(user.sub);
      if (!student || student.id !== studentId) {
        throw new ForbiddenException('No autorizado para ver la información de otro estudiante');
      }
    }
    const result = await this.paymentsService.findByStudent(studentId);
    return {
      payments: result.payments.map((payment) => PaymentModel.fromEntity(payment)),
      accountStatus: { ...result.accountStatus } as PaymentsTotalsModel,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  @Mutation(() => PaymentModel)
  async createPayment(@Args('input') input: CreatePaymentInput): Promise<PaymentModel> {
    const payment = await this.paymentsService.create(input);
    return PaymentModel.fromEntity(payment);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  @Mutation(() => PaymentModel)
  async updatePayment(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdatePaymentInput,
  ): Promise<PaymentModel> {
    const payment = await this.paymentsService.update(id, input);
    return PaymentModel.fromEntity(payment);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  @Query(() => StudentPaymentsModel)
  async paymentsReport(
    @Args('studentId', { type: () => Int, nullable: true }) studentId?: number,
    @Args('startDate', { type: () => String, nullable: true }) startDate?: string,
    @Args('endDate', { type: () => String, nullable: true }) endDate?: string,
  ): Promise<StudentPaymentsModel> {
    const report = await this.paymentsService.getReport({ studentId, startDate, endDate });
    return {
      payments: report.payments.map((payment) => PaymentModel.fromEntity(payment)),
      accountStatus: { ...report.totals } as PaymentsTotalsModel,
    };
  }
}
