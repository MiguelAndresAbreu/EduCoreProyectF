import { PartialType } from '@nestjs/mapped-types';
import { CreateIncidentDto } from './create-incident.dto';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { IncidentStatus } from '../entities/incident.entity';

export class UpdateIncidentDto extends PartialType(CreateIncidentDto) {
  @IsOptional()
  @IsInt()
  reporterId?: number;

  @IsOptional()
  @IsInt()
  reportedId?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;
}
