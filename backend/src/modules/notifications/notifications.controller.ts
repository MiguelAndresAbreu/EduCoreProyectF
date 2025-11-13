import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get('user/:userId')
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() currentUser: JwtPayload,
  ) {
    if (currentUser.role !== UserRole.ADMIN && currentUser.sub !== userId) {
      throw new ForbiddenException('No autorizado para ver las notificaciones de otro usuario');
    }
    return this.notificationsService.findByUser(userId);
  }

  @Put(':id/read')
  markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.markAsRead(id);
  }

  @Put('user/:userId/read')
  markAllAsRead(@Param('userId', ParseIntPipe) userId: number, @CurrentUser() currentUser: JwtPayload) {
    if (currentUser.role !== UserRole.ADMIN && currentUser.sub !== userId) {
      throw new ForbiddenException('No autorizado para actualizar estas notificaciones');
    }
    return this.notificationsService.markAllAsRead(userId);
  }
}
