import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Address } from './address.entity';
import { Wishlist } from './wishlist.entity';
import { PaymentMethod } from './payment-method.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nama: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column()
  password?: string; // Hashed by Bcrypt

  @Column({ default: 'Customer' })
  role: string; // Admin / Seller / Customer

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => Address, address => address.user)
  addresses: Address[];

  @OneToMany(() => Wishlist, wishlist => wishlist.user)
  wishlists: Wishlist[];

  @OneToMany(() => PaymentMethod, pm => pm.user)
  payment_methods: PaymentMethod[];
}
