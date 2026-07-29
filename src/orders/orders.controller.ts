import { Controller, Post, Body, Param, UseGuards, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // @UseGuards(JwtAuthGuard) // Temporarily disabled for guest checkout testing
  @Post('checkout')
  async checkout(@Body() body: { userId: number, items: { variantId: number, qty: number }[] }) {
    return this.ordersService.checkout(body.userId, body.items);
  }

  // @UseGuards(JwtAuthGuard) // Disabled for testing
  @Get('user/:userId')
  async getUserOrders(@Param('userId') userId: string) {
    return this.ordersService.getUserOrders(parseInt(userId));
  }

  @Post('xendit-webhook')
  async xenditWebhook(@Body() body: any) {
    const externalId = body.external_id;
    const status = body.status;
    
    if (!externalId || !externalId.startsWith('order-')) {
      return { message: 'Ignored' };
    }

    const orderId = parseInt(externalId.split('-')[1]);
    let internalStatus = '';
    
    if (status === 'PAID' || status === 'SETTLED') {
      internalStatus = 'Lunas';
    } else if (status === 'EXPIRED') {
      internalStatus = 'Gagal';
    } else {
      return { message: 'Status ignored' };
    }

    await this.ordersService.paymentWebhook(orderId, internalStatus);
    return { success: true };
  }
}
