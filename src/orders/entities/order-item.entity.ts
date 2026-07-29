import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  order_id: number;

  @Column()
  product_variant_id: number;

  @Column('int')
  jumlah_beli: number;

  @Column('decimal', { precision: 10, scale: 2 })
  harga_saat_beli: number; // Menerapkan Price Locking Strategy

  @Column('decimal', { precision: 12, scale: 2 })
  subtotal: number;

  @ManyToOne(() => Order, order => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => ProductVariant, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_variant_id' })
  product_variant: ProductVariant;
}
