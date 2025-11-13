import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IncidentStatus } from '../entities/incident.entity';

export class CreateIncidentDto {
  @IsInt()
  reporterId: number;

  @IsInt()
  reportedId: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsEnum(IncidentStatus)
  status?: IncidentStatus;
}
