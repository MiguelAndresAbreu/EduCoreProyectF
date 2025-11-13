import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { StudentsService } from '../students/students.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly studentsService: StudentsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const student = await this.studentsService.findOne(createPaymentDto.studentId);

    const duplicate = await this.paymentRepository.findOne({
      where: {
        student: { id: student.id },
        concept: createPaymentDto.concept,
        paymentDate: createPaymentDto.paymentDate,
        amount: createPaymentDto.amount,
      },
    });

    if (duplicate) {
      throw new BadRequestException('Ya existe un pago registrado con estos datos');
    }

    const payment = this.paymentRepository.create({
      student,
      amount: createPaymentDto.amount,
      concept: createPaymentDto.concept,
      paymentDate: createPaymentDto.paymentDate,
      method: createPaymentDto.method,
      status: createPaymentDto.status,
    });

    const saved = await this.paymentRepository.save(payment);
    await this.notifyStudent(saved);
    return saved;
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto) {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['student', 'student.user'],
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    if (updatePaymentDto.studentId) {
      payment.student = await this.studentsService.findOne(updatePaymentDto.studentId);
    }

    Object.assign(payment, {
      amount: updatePaymentDto.amount ?? payment.amount,
      concept: updatePaymentDto.concept ?? payment.concept,
      paymentDate: updatePaymentDto.paymentDate ?? payment.paymentDate,
      method: updatePaymentDto.method ?? payment.method,
      status: updatePaymentDto.status ?? payment.status,
    });

    const saved = await this.paymentRepository.save(payment);
    await this.notifyStudent(saved);
    return saved;
  }

  async findByStudent(studentId: number) {
    const student = await this.studentsService.findOne(studentId);
    const payments = await this.paymentRepository.find({
      where: { student: { id: student.id } },
      order: { paymentDate: 'DESC' },
    });

    return {
      payments,
      accountStatus: this.calculateAccountStatus(payments),
    };
  }

  async getReport(options: { startDate?: string; endDate?: string; studentId?: number }) {
    const where: any = {};

    if (options.studentId) {
      where.student = { id: options.studentId };
    }

    if (options.startDate && options.endDate) {
      where.paymentDate = Between(options.startDate, options.endDate);
    }

    const payments = await this.paymentRepository.find({
      where,
      relations: ['student', 'student.person'],
      order: { paymentDate: 'DESC' },
    });

    const accountStatus = this.calculateAccountStatus(payments);

    return {
      payments,
      totals: accountStatus,
    };
  }

  private calculateAccountStatus(payments: Payment[]) {
    const totals = payments.reduce(
      (acc, payment) => {
        if (payment.status === PaymentStatus.PAID) {
          acc.paid += Number(payment.amount);
        } else if (payment.status === PaymentStatus.PENDING) {
          acc.pending += Number(payment.amount);
        }
        return acc;
      },
      { paid: 0, pending: 0 },
    );

    return {
      paid: Number(totals.paid.toFixed(2)),
      pending: Number(totals.pending.toFixed(2)),
      balance: Number((totals.paid - totals.pending).toFixed(2)),
    };
  }

  private async notifyStudent(payment: Payment) {
    if (!payment.student?.user) {
      const student = await this.studentsService.findOne(payment.student.id);
      payment.student = student;
    }

    const studentUser = payment.student.user;
    if (!studentUser) {
      return;
    }

    const title = payment.status === PaymentStatus.PAID ? 'Pago registrado' : 'Pago pendiente';
    const message =
      payment.status === PaymentStatus.PAID
        ? `Se registró el pago de ${payment.concept} por $${Number(payment.amount).toFixed(2)}`
        : `Tienes un pago pendiente de ${payment.concept} por $${Number(payment.amount).toFixed(2)}`;

    await this.notificationsService.create({
      title,
      message,
      recipientId: studentUser.id,
      type: NotificationType.PAYMENT,
    });
  }
}
