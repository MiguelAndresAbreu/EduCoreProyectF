import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum FinanceRecordType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

@Entity({ name: 'finance_records' })
export class FinanceRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: FinanceRecordType })
  type: FinanceRecordType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column()
  concept: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
