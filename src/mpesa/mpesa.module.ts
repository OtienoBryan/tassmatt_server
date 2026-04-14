import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../entities/order.entity';
import { MpesaController } from './mpesa.controller';
import { MpesaService } from './mpesa.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  controllers: [MpesaController],
  providers: [MpesaService],
  exports: [MpesaService],
})
export class MpesaModule {}
