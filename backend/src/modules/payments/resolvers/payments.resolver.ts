import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import { PaymentsService } from '../payments.service';
import { PaymentModel, PaymentsTotalsModel, StudentPaymentsModel } from '../models/payment.model';
import { CreatePaymentInput } from '../models/payment.input';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { StudentsService } from '../../students/students.service';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

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
}
