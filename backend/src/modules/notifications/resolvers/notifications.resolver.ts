import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { NotificationsService } from '../notifications.service';
import { NotificationModel } from '../models/notification.model';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { CreateNotificationInput } from '../inputs/notification.input';

@Resolver(() => NotificationModel)
export class NotificationsResolver {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Mutation(() => NotificationModel)
  async createNotification(
    @Args('input') input: CreateNotificationInput,
  ): Promise<NotificationModel> {
    const notification = await this.notificationsService.create(input);
    if (!notification) {
      throw new Error('No se pudo crear la notificación');
    }
    return NotificationModel.fromEntity(notification);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [NotificationModel])
  async notificationsByUser(
    @Args('userId', { type: () => Int }) userId: number,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<NotificationModel[]> {
    if (currentUser.role !== UserRole.ADMIN && currentUser.sub !== userId) {
      throw new ForbiddenException('No autorizado para ver estas notificaciones');
    }
    const notifications = await this.notificationsService.findByUser(userId);
    return notifications
      .map((notification) => NotificationModel.fromEntity(notification))
      .filter((item): item is NotificationModel => item !== null);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => NotificationModel)
  async markNotificationAsRead(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<NotificationModel> {
    const notification = await this.notificationsService.markAsRead(id);
    if (!notification) {
      throw new Error('Notificación no encontrada');
    }
    return NotificationModel.fromEntity(notification);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => [NotificationModel])
  async markAllNotificationsAsRead(
    @Args('userId', { type: () => Int }) userId: number,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<NotificationModel[]> {
    if (currentUser.role !== UserRole.ADMIN && currentUser.sub !== userId) {
      throw new ForbiddenException('No autorizado para actualizar estas notificaciones');
    }
    const notifications = await this.notificationsService.markAllAsRead(userId);
    return notifications
      .map((notification) => NotificationModel.fromEntity(notification))
      .filter((item): item is NotificationModel => item !== null);
  }
}
