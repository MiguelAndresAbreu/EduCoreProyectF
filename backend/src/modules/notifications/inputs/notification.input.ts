import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsInt, IsString } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

@InputType()
export class CreateNotificationInput {
  @Field(() => String)
  @IsString()
  title: string;

  @Field(() => String)
  @IsString()
  message: string;

  @Field(() => NotificationType)
  @IsEnum(NotificationType)
  type: NotificationType;

  @Field(() => Int)
  @IsInt()
  recipientId: number;
}
