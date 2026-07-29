import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Shop } from '../shops/entities/shop.entity';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ProductsService implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(ProductVariant)
    private variantRepository: Repository<ProductVariant>,
    @InjectRepository(Shop)
    private shopRepository: Repository<Shop>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedData();
  }

  async findAll(categoryName?: string): Promise<Product[]> {
    if (categoryName) {
      return this.productRepository.find({
        where: { category: { nama_kategori: categoryName } },
        relations: { category: true, shop: true, variants: true },
      });
    }
    return this.productRepository.find({
      relations: { category: true, shop: true, variants: true },
    });
  }

  async findOne(id: number): Promise<Product | null> {
    return this.productRepository.findOne({
      where: { id },
      relations: { category: true, shop: true, variants: true },
    });
  }

  private async seedData() {
    const productCount = await this.productRepository.count();
    if (productCount > 0) {
      this.logger.log('Products already exist. Skipping seed.');
      return;
    }

    this.logger.log('Seeding initial data...');

    // 1. Create Dummy User
    let dummyUser = await this.userRepository.findOne({ where: { email: 'dummy@tudeys.com' } });
    if (!dummyUser) {
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      dummyUser = this.userRepository.create({
        nama: 'John Dummy',
        email: 'dummy@tudeys.com',
        password: hashedPassword,
        role: 'Admin',
      });
      dummyUser = await this.userRepository.save(dummyUser);
    }

    // 2. Create Dummy Shop
    let dummyShop = await this.shopRepository.findOne({ where: { user_id: dummyUser.id } });
    if (!dummyShop) {
      dummyShop = this.shopRepository.create({
        user_id: dummyUser.id,
        nama_toko: 'TudeysOutfit Official',
        deskripsi_toko: 'The official shop of TudeysOutfit.',
      });
      dummyShop = await this.shopRepository.save(dummyShop);
    }

    // 3. Create Categories
    const categoryNames = ['Outerwear', 'Knitwear', 'Shirts & Blouses', 'Trousers', 'Accessories'];
    const categories: Record<string, Category> = {};
    
    for (const name of categoryNames) {
      let cat = await this.categoryRepository.findOne({ where: { nama_kategori: name } });
      if (!cat) {
        cat = this.categoryRepository.create({ nama_kategori: name });
        cat = await this.categoryRepository.save(cat);
      }
      categories[name] = cat;
    }

    // 4. Create Products
    const dummyProducts = [
      {
        name: "Tailored Wool Blazer",
        desc: "A beautifully tailored wool blazer.",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA0p4OLeRlO7AB8PdfVyTha5_XzoRomGLn8u3VkMMvH2BHcH9RWQ1b13vYveB2UIEIdRMT_Df4K77ZgYLn5c4m399LUFzUTyGnta9BQiXy--4cqIQbkCx-979Wuh5LXoikeMHHi2YwrsVaNHSqx1S7Quwju0H0-q7UGvZZKQ6JgkxX937ha1T4Gc2vnK6rmhZJgfauweUYzOvf0VXe5W7RSopAkgF3Qq351WYd5_q20ZOtsN4gu08jjMwI3cj2Dc-kUeM1pF3y6",
        badge: "New",
        category: "Outerwear",
        color: "Charcoal",
        price: 4499000
      },
      {
        name: "Draped Silk Blouse",
        desc: "Elegant draped silk blouse for any occasion.",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCTdd1WsED5mhyP6Fa4Fw0OBW6uWr4gYNgDzPYHQtznkwmhiJpgo_Yjs366Vt8u8zZ0C_J1faQSY5NTp4Eaz2cDhA2tGvDaaXGW7VmjvtLf8jdDh00sslYEX9MXTr0dNpHQ776vB6BIi0AqmOrpZvxbAQXez9pgxccYf2iCna1bRvgoKaw4XOWjdujjIkAYWxlA3ofYAMAlaEFcFB0k64Uf44n58Lp8nKi3M2VVXi85bf49rG86BzogfRnIlPfyH6OTTxZj3hWX",
        badge: null,
        category: "Shirts & Blouses",
        color: "Champagne",
        price: 4275000
      },
      {
        name: "Pleated Wide Trousers",
        desc: "Comfortable and stylish pleated wide trousers.",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZUDILwAM7-_PvaYH2BE7tz4Mv3zck7vqEISvssUvIS7we7bWeybKOEr7h_b7fD9E298EZ1U93nDqq97ladLnoKNxDQoPyNXm2LVlHwwYJevPhurb-dj5m9fktAbfo0xQPjqrK27G5B2nF_KpAlpYwWyPcyLNyBXnbW0Jk5l--4j0r10jR6jOTKAzN_w4iw90N0ih6zSEVOWugpzYaoY5_j_1V3RyN3OBw594SopF2Ur_zhiFYBQln3JAMRnp1uodhbP6rJ17E",
        badge: "Sustainable",
        category: "Trousers",
        color: "Espresso",
        price: 4800000
      },
      {
        name: "Oversized Cashmere Knit",
        desc: "Cozy oversized cashmere knit.",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBk2X_0fY5Ft5W0LaGk43dNe5XWpPqDbA73uvZNrjOt8Lc0GXdrlGpg1o2kmCcPjwpVKwtrkgwYRQxobXsc-ZaUwJsHyPrgocJix590W2sDqqgclSTtff3nSFkk_V2_-hL0iKM1toaSofeq-q7B2iuUTI5_NdX9DDF85zh-XZ1YmsDAaimfWXeMpSroyCOlw8PGuhebtKGGmhUyK208fy8HeMQeFNEKww-ZdQmtPSJDuLWvDF61BZiPW8LJYMy6AE7Xbju9Sscd",
        badge: null,
        category: "Knitwear",
        color: "Ivory",
        price: 8250000
      },
      {
        name: "Structured Crossbody",
        desc: "A versatile structured crossbody bag.",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCqE0LQASILtnxBYscjfIUVAWnmhH5hXuU1aw-fSMnkZNG0FxSl3mZ6tvAWYQS3mpw9kFU7558QnLIFtITTrYxMbtEYZ_fKXoo2r2VF60jGC_nw-bf1M29tct5chnPdyIkmFTt8OrPz0nyqViIArWMV2l1ahfY9RxWaLzJJ20wejqGj_3p7wEamXF2zc9HpstjWLnE2K1vDYb5xTmZem-oydx5zcuwQhZn4JyTxF1XnMol6NRu45iDAk6clIwGKGjQKiE64p2A",
        badge: null,
        category: "Accessories",
        color: "Matte Black",
        price: 5850000
      },
      {
        name: "Asymmetric Midi Dress",
        desc: "Beautiful asymmetric midi dress.",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDu9b9G_gPhuAD9TGf76OYD3Qj95d34TK5OcKqnqa7OXQXJQ1ZV-q8DcaerlIB2ixXZZ-uTeuQ88D3-pnwvPgFA8O2tgA5sWMzoYAclMZGoxzjlnC-Nj9pQfLWco7iu-TGZ9F-HtBJH3n2vE9Ob-IUI54tbbrxVVYf2Xnb2gQe1r4ESOBpDYOU5FPHPdEIPB18AmMMZrJzCVuC-FAzzVvrF0rkUKn1_4PYW33pNfPR9HakvAz5FtX4b8cANdMjv9ab6U67UBgYI",
        badge: null,
        category: "Outerwear", // Just assigning something
        color: "Olive",
        price: 6300000
      }
    ];

    for (const dp of dummyProducts) {
      const prod = this.productRepository.create({
        nama_produk: dp.name,
        deskripsi: dp.desc,
        image: dp.image,
        badge: dp.badge,
        category_id: categories[dp.category].id,
        shop_id: dummyShop.id,
      });
      const savedProd = await this.productRepository.save(prod);

      // Create variant
      const variant = this.variantRepository.create({
        product_id: savedProd.id,
        ukuran: 'M',
        warna: dp.color,
        harga: dp.price,
        stok: 100,
      });
      await this.variantRepository.save(variant);
    }

    this.logger.log('Seeding complete.');
  }
}
