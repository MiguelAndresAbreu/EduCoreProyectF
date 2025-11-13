import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsInt()
  recipientId: number;

  @IsEnum(NotificationType)
  type: NotificationType;
}
