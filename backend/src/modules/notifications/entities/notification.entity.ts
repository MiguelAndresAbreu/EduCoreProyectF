import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  SYSTEM = 'SYSTEM',
  PAYMENT = 'PAYMENT',
  REMINDER = 'REMINDER',
  ACADEMIC = 'ACADEMIC',
}

@Entity({ name: 'notifications' })
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
