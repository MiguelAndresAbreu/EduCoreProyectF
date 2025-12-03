import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum IncidentStatus {
  OPEN = 'OPEN',
  REVIEW = 'REVIEW',
  CLOSED = 'CLOSED',
}

@Entity({ name: 'incidents' })
export class Incident {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true, onDelete: 'SET NULL', nullable: true  })
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @ManyToOne(() => User, { eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reported_id' })
  reported: User;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'enum', enum: IncidentStatus, default: IncidentStatus.OPEN })
  status: IncidentStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
