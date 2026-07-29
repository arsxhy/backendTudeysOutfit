import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('payment_methods')
export class PaymentMethod {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  provider_name: string; // e.g., 'GoPay', 'OVO', 'QRIS', 'Dana'

  @Column()
  account_name: string;

  @Column()
  account_number: string;

  @Column({ default: false })
  is_default: boolean;

  @ManyToOne(() => User, user => user.payment_methods, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  created_at: Date;
}
