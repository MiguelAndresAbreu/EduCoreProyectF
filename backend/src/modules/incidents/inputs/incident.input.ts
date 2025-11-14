import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { IncidentStatus } from '../entities/incident.entity';

@InputType()
export class CreateIncidentInput {
  @Field(() => Int)
  @IsInt()
  reporterId: number;

  @Field(() => Int)
  @IsInt()
  reportedId: number;

  @Field(() => String)
  @IsString()
  description: string;

  @Field(() => String)
  @IsDateString()
  date: string;

  @Field(() => IncidentStatus, { nullable: true })
  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;
}

@InputType()
export class UpdateIncidentInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  reporterId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  reportedId?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsDateString()
  date?: string;

  @Field(() => IncidentStatus, { nullable: true })
  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;
}
