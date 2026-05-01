import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDatabaseConfig } from './config/database.config';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { SubCategoriesModule } from './subcategories/subcategories.module';
import { OrdersModule } from './orders/orders.module';
import { AdminModule } from './admin/admin.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { RidersModule } from './riders/riders.module';
import { BrandsModule } from './brands/brands.module';
import { BlogsModule } from './blogs/blogs.module';
import { GalleryModule } from './gallery/gallery.module';
import { PoliciesModule } from './policies/policies.module';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';
import { MpesaModule } from './mpesa/mpesa.module';
import { QuotationModule } from './quotation/quotation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    CloudinaryModule,
    ProductsModule,
    CategoriesModule,
    SubCategoriesModule,
    OrdersModule,
    AdminModule,
    RidersModule,
    BrandsModule,
    BlogsModule,
    GalleryModule,
    PoliciesModule,
    EmailModule,
    AuthModule,
    MpesaModule,
    QuotationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
