import { Field, InputType } from '@nestjs/graphql';
import { IncidentStatus } from '../entities/incident.entity';

@InputType()
export class CreateIncidentInput {
  @Field()
  reporterId: number;

  @Field()
  reportedId: number;

  @Field()
  description: string;

  @Field()
  date: string;

  @Field(() => IncidentStatus, { nullable: true })
  status?: IncidentStatus;
}

@InputType()
export class UpdateIncidentStatusInput {
  @Field()
  id: number;

  @Field(() => IncidentStatus)
  status: IncidentStatus;
}
