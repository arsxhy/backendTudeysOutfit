import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { User } from '../users/entities/user.entity';
import { Xendit } from 'xendit-node';

@Injectable()
export class OrdersService {
  private xendit: Xendit;

  constructor(
    @InjectRepository(Order) private ordersRepo: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemsRepo: Repository<OrderItem>,
    @InjectRepository(ProductVariant) private productVariantRepo: Repository<ProductVariant>,
    private dataSource: DataSource
  ) {
    this.xendit = new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY || '' });
  }

  async getUserOrders(userId: number) {
    return this.ordersRepo.find({
      where: { user_id: userId },
      relations: {
        items: {
          product_variant: {
            product: true
          }
        }
      },
      order: { id: 'DESC' }
    });
  }

  async checkout(userId: number, items: { variantId: number, qty: number }[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      let total_harga = 0;
      
      const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
      if (!user) throw new BadRequestException('User tidak ditemukan');

      const order = this.ordersRepo.create({ user_id: userId, status_bayar: 'Belum Bayar', total_harga: 0 });
      let savedOrder = await queryRunner.manager.save(order);

      for (const item of items) {
        // Soft Lock Stok
        const variant = await queryRunner.manager.findOne(ProductVariant, { where: { id: item.variantId } });
        if (!variant || variant.stok < item.qty) {
          throw new BadRequestException(`Stok tidak mencukupi untuk variant ${item.variantId}`);
        }
        
        variant.stok -= item.qty;
        await queryRunner.manager.save(variant);

        const subtotal = variant.harga * item.qty;
        total_harga += subtotal;

        // Price Locking Strategy
        const orderItem = this.orderItemsRepo.create({
          order_id: savedOrder.id,
          product_variant_id: variant.id,
          jumlah_beli: item.qty,
          harga_saat_beli: variant.harga,
          subtotal: subtotal
        });
        await queryRunner.manager.save(orderItem);
      }

      savedOrder.total_harga = total_harga;
      savedOrder = await queryRunner.manager.save(savedOrder);
      
      // Xendit Integration
      try {
        const invoice = await this.xendit.Invoice.createInvoice({
          data: {
            externalId: `order-${savedOrder.id}`,
            amount: total_harga,
            payerEmail: user.email,
            description: `Tudeys Outfit - Order #${savedOrder.id}`,
            successRedirectUrl: 'http://localhost:3000/shop'
          }
        });
        
        savedOrder.invoice_id = invoice.id || '';
        savedOrder.payment_url = invoice.invoiceUrl || '';
        await queryRunner.manager.save(savedOrder);
      } catch (xenditErr) {
        console.error("Xendit Error:", xenditErr);
        throw new BadRequestException("Gagal menggenerate payment link dari Xendit");
      }

      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async paymentWebhook(orderId: number, status: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, { where: { id: orderId }, relations: { items: true } });
      if (!order) throw new BadRequestException('Order tidak ditemukan');

      if (status === 'Lunas') {
        order.status_bayar = 'Diproses';
      } else if (status === 'Gagal') {
        order.status_bayar = 'Dibatalkan';
        for (const item of order.items) {
          const variant = await queryRunner.manager.findOne(ProductVariant, { where: { id: item.product_variant_id } });
          if (variant) {
            variant.stok += item.jumlah_beli;
            await queryRunner.manager.save(variant);
          }
        }
      }
      
      const savedOrder = await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
