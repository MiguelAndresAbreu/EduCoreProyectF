import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Notification, NotificationType } from '../entities/notification.entity';
import { UserModel } from '../../users/models/user.model';

registerEnumType(NotificationType, { name: 'NotificationType' });

@ObjectType()
export class NotificationModel {
  @Field(() => ID)
  id: number;

  @Field()
  title: string;

  @Field()
  message: string;

  @Field(() => NotificationType)
  type: NotificationType;

  @Field()
  read: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => UserModel)
  recipient: UserModel;

  static fromEntity(entity: Notification): NotificationModel {
    const model = new NotificationModel();
    model.id = entity.id;
    model.title = entity.title;
    model.message = entity.message;
    model.type = entity.type;
    model.read = !!entity.read;
    model.createdAt = entity.createdAt;
    const recipient = UserModel.fromEntity(entity.recipient);
    if (!recipient) {
      throw new Error('Notification entity is missing recipient relation');
    }
    model.recipient = recipient;
    return model;
  }
}
