import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  label: string; // Rumah, Kantor, dll.

  @Column({ default: '' })
  penerima_nama: string;

  @Column({ default: '' })
  penerima_telepon: string;

  @Column('text')
  detail_alamat: string;

  @Column({ default: '' })
  provinsi: string;

  @Column({ default: '' })
  kota_kabupaten: string;

  @Column({ default: '' })
  kecamatan: string;

  @Column()
  kode_pos: string;

  @Column({ default: false })
  is_primary: boolean;

  @ManyToOne(() => User, user => user.addresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
