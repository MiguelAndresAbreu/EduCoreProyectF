import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly usersService: UsersService,
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    const recipient = await this.usersService.findById(createNotificationDto.recipientId);

    const notification = this.notificationRepository.create({
      title: createNotificationDto.title,
      message: createNotificationDto.message,
      type: createNotificationDto.type,
      recipient,
    });

    return this.notificationRepository.save(notification);
  }

  async notifyMany(params: {
    title: string;
    message: string;
    recipientIds: number[];
    type: NotificationType;
  }) {
    if (!params.recipientIds.length) {
      return [];
    }

    const recipients = await this.usersService.findByIds(params.recipientIds);
    const notifications = this.notificationRepository.create(
      recipients.map((recipient) => ({
        title: params.title,
        message: params.message,
        type: params.type,
        recipient,
      })),
    );

    return this.notificationRepository.save(notifications);
  }

  findByUser(userId: number) {
    return this.notificationRepository.find({
      where: { recipient: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: number) {
    await this.notificationRepository.update(id, { read: true });
    return this.notificationRepository.findOne({ where: { id } });
  }

  async markAllAsRead(userId: number) {
    await this.notificationRepository.update({ recipient: { id: userId } }, { read: true });
    return this.findByUser(userId);
  }
}
