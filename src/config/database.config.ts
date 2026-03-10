import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Category, Product, User, Cart, CartItem, Order, OrderItem, Rider, SubCategory, Brand } from '../entities';
import { BlogCategory } from '../entities/blog-category.entity';
import { Blog } from '../entities/blog.entity';
import { Gallery } from '../entities/gallery.entity';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_DATABASE'),
  entities: [Category, Product, User, Cart, CartItem, Order, OrderItem, Rider, SubCategory, Brand, BlogCategory, Blog, Gallery],
  synchronize: false, // Disabled to avoid schema conflicts
  logging: configService.get<string>('NODE_ENV') === 'development',
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  migrationsRun: false,
});
