import { Controller, Get, Put, Post, Delete, Param, Body, BadRequestException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Put(':id/change-password')
  async changePassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    try {
      return await this.usersService.changePassword(+id, updatePasswordDto);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/deactivate')
  async deactivateAccount(@Param('id') id: string) {
    try {
      return await this.usersService.deactivateAccount(+id);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  // Profile Endpoints
  @UseGuards(JwtAuthGuard)
  @Put(':id/profile')
  async updateProfile(@Param('id') id: string, @Body() updateData: any) {
    try {
      return await this.usersService.updateProfile(+id, updateData);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  // Address Endpoints
  @UseGuards(JwtAuthGuard)
  @Get(':id/addresses')
  async getAddresses(@Param('id') id: string) {
    try {
      return await this.usersService.getAddresses(+id);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/addresses')
  async addAddress(@Param('id') id: string, @Body() addressData: any) {
    try {
      return await this.usersService.addAddress(+id, addressData);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('addresses/:addressId')
  async updateAddress(@Param('addressId') addressId: string, @Body() addressData: any) {
    try {
      return await this.usersService.updateAddress(+addressId, addressData);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('addresses/:addressId')
  async deleteAddress(@Param('addressId') addressId: string) {
    try {
      return await this.usersService.deleteAddress(+addressId);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/addresses/:addressId/default')
  async setAsDefaultAddress(@Param('id') id: string, @Param('addressId') addressId: string) {
    try {
      return await this.usersService.setAsDefaultAddress(+id, +addressId);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  // Wishlist Endpoints
  @UseGuards(JwtAuthGuard)
  @Get(':id/wishlist')
  async getWishlist(@Param('id') id: string) {
    try {
      return await this.usersService.getWishlist(+id);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/wishlist/:productId')
  async addToWishlist(@Param('id') id: string, @Param('productId') productId: string) {
    try {
      return await this.usersService.addToWishlist(+id, +productId);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/wishlist/:productId')
  async removeFromWishlist(@Param('id') id: string, @Param('productId') productId: string) {
    try {
      return await this.usersService.removeFromWishlist(+id, +productId);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }
}
