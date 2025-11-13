import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { StudentsService } from '../students/students.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly studentsService: StudentsService,
  ) {}

  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Roles(UserRole.ADMIN, UserRole.FINANCE, UserRole.STUDENT)
  @Get('student/:id')
  async findByStudent(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    if (user.role === UserRole.STUDENT) {
      const student = await this.studentsService.findByUserId(user.sub);
      if (!student || student.id !== id) {
        throw new ForbiddenException('No autorizado para ver la información de otro estudiante');
      }
    }
    return this.paymentsService.findByStudent(id);
  }

  @Roles(UserRole.ADMIN, UserRole.FINANCE)
  @Get('report')
  report(
    @Query('studentId') studentId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.paymentsService.getReport({
      studentId: studentId ? Number(studentId) : undefined,
      startDate,
      endDate,
    });
  }
}
