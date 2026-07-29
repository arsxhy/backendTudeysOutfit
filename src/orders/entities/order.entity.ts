import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number; // Nomor Invoice

  @Column()
  user_id: number;

  @Column('decimal', { precision: 12, scale: 2 })
  total_harga: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  ongkos_kirim: number;

  @Column({ default: 'Belum Bayar' }) // Belum Bayar, Diproses, Dikirim, Selesai, Dibatalkan
  status_bayar: string;
  
  @Column({ nullable: true })
  no_resi: string;

  @Column({ nullable: true })
  invoice_id: string;

  @Column({ nullable: true })
  payment_url: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => OrderItem, item => item.order, { cascade: true })
  items: OrderItem[];
}
