import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { QuotationRecord, QuotationItemRecord } from './quotation.entity';

@Injectable()
export class QuotationDbService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QuotationDbService.name);
  private dataSource: DataSource | null = null;

  constructor(private readonly cfg: ConfigService) {}

  async onModuleInit() {
    const host = this.cfg.get<string>('QUOTATION_DB_HOST');
    const database = this.cfg.get<string>('QUOTATION_DB_DATABASE');

    if (!host || !database) {
      this.logger.warn('QUOTATION_DB_* env vars not set — quotation DB persistence disabled.');
      return;
    }

    try {
      this.dataSource = new DataSource({
        type: 'mysql',
        host,
        port: this.cfg.get<number>('QUOTATION_DB_PORT') ?? 3306,
        username: this.cfg.get<string>('QUOTATION_DB_USERNAME'),
        password: this.cfg.get<string>('QUOTATION_DB_PASSWORD'),
        database,
        entities: [QuotationRecord, QuotationItemRecord],
        // Tables already exist — do NOT let TypeORM modify them
        synchronize: false,
        logging: false,
      });
      await this.dataSource.initialize();
      this.logger.log(`Connected to quotation database: ${database}@${host}`);
    } catch (err: unknown) {
      this.logger.error(
        `Could not connect to quotation database: ${err instanceof Error ? err.message : String(err)}`,
      );
      this.dataSource = null;
    }
  }

  async onModuleDestroy() {
    if (this.dataSource?.isInitialized) {
      await this.dataSource.destroy();
    }
  }

  async saveQuotation(data: {
    quotationRef: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string | null;
    deliveryAddress?: string | null;
    notes?: string | null;
    items: Array<{
      productName: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }>;
    subtotal: number;
    tax: number;
    total: number;
  }): Promise<void> {
    if (!this.dataSource?.isInitialized) {
      this.logger.warn('Quotation DB not available — skipping DB save.');
      return;
    }

    const dateStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const subtotal = Number(data.subtotal) || 0;
    const taxAmount = Number(data.tax) || 0;
    const total = Number(data.total) || 0;

    const quotationRepo = this.dataSource.getRepository(QuotationRecord);
    const itemRepo = this.dataSource.getRepository(QuotationItemRecord);

    // Insert the quotation header
    const quotation = quotationRepo.create({
      customer_id: 0,
      customer: data.customerName,
      mobile: data.customerPhone ?? '',
      comment: data.deliveryAddress ?? '',
      comment2: [data.quotationRef, data.notes].filter(Boolean).join(' — '),
      address: data.deliveryAddress ?? '',
      total: subtotal,
      tax: 16,
      tax_type: 'Inclusive',
      total_tax: taxAmount,
      total_cost: subtotal,
      all_total: total,
      discount: 0,
      percentage_discount: 0,
      discount_amount: 0,
      amount_paid: 0,
      balance: total,
      staff: 'Website',
      currency: 'Kenya Shilling',
      currency_symbol: 'KES',
      date: dateStr,
      status: 0,
      view: 0,
    });

    await quotationRepo.save(quotation);
    this.logger.log(`Saved quotation header id=${quotation.id} for ${data.customerName}`);

    // Insert each item linked to the new quotation id
    for (const item of data.items) {
      const row = itemRepo.create({
        quote_id: quotation.id,
        customer_id: 0,
        sale_status: 0,
        product_id: 0,
        product_name: item.productName,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        measure: 'pcs',
        sub_total: item.lineTotal,
        unit_buying: 0,
        sub_buying: 0,
        details: '',
        image: '',
        staff: 'Website',
        date: dateStr,
      });
      await itemRepo.save(row);
    }

    this.logger.log(
      `Saved ${data.items.length} quotation item(s) for quotation id=${quotation.id}`,
    );
  }
}
