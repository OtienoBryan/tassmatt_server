import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QuotationController } from './quotation.controller';
import { QuotationDbService } from './quotation-db.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule, ConfigModule],
  providers: [QuotationDbService],
  controllers: [QuotationController],
})
export class QuotationModule {}
