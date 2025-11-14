import { Field, InputType } from '@nestjs/graphql';
import { NotificationType } from '../entities/notification.entity';

@InputType()
export class CreateNotificationInput {
  @Field()
  title: string;

  @Field()
  message: string;

  @Field(() => NotificationType)
  type: NotificationType;

  @Field()
  recipientId: number;
}
