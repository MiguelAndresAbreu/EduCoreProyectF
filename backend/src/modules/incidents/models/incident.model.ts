import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Incident, IncidentStatus } from '../entities/incident.entity';
import { UserModel } from '../../users/models/user.model';

registerEnumType(IncidentStatus, { name: 'IncidentStatus' });

@ObjectType()
export class IncidentModel {
  @Field(() => ID)
  id: number;

  @Field(() => UserModel, { nullable: true })
  reporter?: UserModel | null;

  @Field(() => UserModel, { nullable: true })
  reported?: UserModel | null;

  @Field()
  description: string;

  @Field()
  date: string;

  @Field(() => IncidentStatus)
  status: IncidentStatus;

  @Field(() => Date)
  createdAt: Date;

  static fromEntity(entity: Incident): IncidentModel {
    const model = new IncidentModel();
    model.id = entity.id;
    model.reporter = UserModel.fromEntity(entity.reporter);
    model.reported = UserModel.fromEntity(entity.reported);
    model.description = entity.description;
    model.date = entity.date;
    model.status = entity.status;
    model.createdAt = entity.createdAt;
    return model;
  }
}
