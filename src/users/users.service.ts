import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';
import { Wishlist } from './entities/wishlist.entity';
import * as bcrypt from 'bcrypt';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(user);
    if (newUser.password) {
      newUser.password = await bcrypt.hash(newUser.password, 10);
    }
    return this.usersRepository.save(newUser);
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async changePassword(id: number, updatePasswordDto: UpdatePasswordDto): Promise<{ message: string }> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.password) {
      throw new Error('User does not have a password set');
    }

    const isMatch = await bcrypt.compare(updatePasswordDto.currentPassword, user.password);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    user.password = await bcrypt.hash(updatePasswordDto.newPassword, 10);
    await this.usersRepository.save(user);

    return { message: 'Password updated successfully' };
  }

  async deactivateAccount(id: number): Promise<{ message: string }> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    user.is_active = false;
    await this.usersRepository.save(user);

    return { message: 'Account deactivated successfully' };
  }

  // Profile Methods
  async updateProfile(id: number, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new Error('User not found');
    
    if (updateData.nama) user.nama = updateData.nama;
    if (updateData.phone) user.phone = updateData.phone;
    
    return this.usersRepository.save(user);
  }

  // Address Methods
  async getAddresses(userId: number): Promise<Address[]> {
    return this.addressRepository.find({ where: { user_id: userId } });
  }

  async addAddress(userId: number, addressData: Partial<Address>): Promise<Address> {
    const addresses = await this.getAddresses(userId);
    const newAddress = this.addressRepository.create({
      ...addressData,
      user_id: userId,
      is_primary: addressData.is_primary ?? addresses.length === 0,
    });
    
    if (newAddress.is_primary) {
      await this.addressRepository.update({ user_id: userId }, { is_primary: false });
    }
    
    return this.addressRepository.save(newAddress);
  }

  async updateAddress(addressId: number, addressData: Partial<Address>): Promise<Address> {
    const address = await this.addressRepository.findOne({ where: { id: addressId } });
    if (!address) throw new Error('Address not found');

    if (addressData.is_primary) {
      await this.addressRepository.update({ user_id: address.user_id }, { is_primary: false });
    }

    Object.assign(address, addressData);
    return this.addressRepository.save(address);
  }

  async deleteAddress(addressId: number): Promise<{ message: string }> {
    await this.addressRepository.delete(addressId);
    return { message: 'Address deleted successfully' };
  }

  async setAsDefaultAddress(userId: number, addressId: number): Promise<{ message: string }> {
    await this.addressRepository.update({ user_id: userId }, { is_primary: false });
    await this.addressRepository.update({ id: addressId }, { is_primary: true });
    return { message: 'Default address updated successfully' };
  }

  // Wishlist Methods
  async getWishlist(userId: number): Promise<Wishlist[]> {
    return this.wishlistRepository.find({
      where: { user_id: userId },
      relations: { product: { variants: true, category: true } }
    });
  }

  async addToWishlist(userId: number, productId: number): Promise<Wishlist> {
    const existing = await this.wishlistRepository.findOne({ where: { user_id: userId, product_id: productId } });
    if (existing) {
      return existing;
    }
    const wishlistItem = this.wishlistRepository.create({ user_id: userId, product_id: productId });
    return this.wishlistRepository.save(wishlistItem);
  }

  async removeFromWishlist(userId: number, productId: number): Promise<{ message: string }> {
    await this.wishlistRepository.delete({ user_id: userId, product_id: productId });
    return { message: 'Item removed from wishlist' };
  }
}
