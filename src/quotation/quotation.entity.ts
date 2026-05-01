import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'quotation' })
export class QuotationRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', default: 0 })
  customer_id: number;

  @Column({ type: 'text' })
  customer: string;

  @Column({ type: 'varchar', length: 20, default: '' })
  mobile: string;

  @Column({ type: 'text', default: '' })
  comment: string;

  @Column({ type: 'text', default: '' })
  comment2: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  address: string;

  @Column({ type: 'decimal', precision: 11, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'int', default: 16 })
  tax: number;

  @Column({ type: 'varchar', length: 100, default: 'Inclusive' })
  tax_type: string;

  @Column({ type: 'decimal', precision: 11, scale: 2, default: 0 })
  total_tax: number;

  @Column({ type: 'decimal', precision: 11, scale: 2, default: 0 })
  total_cost: number;

  @Column({ type: 'decimal', precision: 11, scale: 2, default: 0 })
  all_total: number;

  @Column({ type: 'int', default: 0 })
  discount: number;

  @Column({ type: 'int', default: 0 })
  percentage_discount: number;

  @Column({ type: 'int', default: 0 })
  discount_amount: number;

  @Column({ type: 'decimal', precision: 11, scale: 2, default: 0 })
  amount_paid: number;

  @Column({ type: 'decimal', precision: 11, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'varchar', length: 200, default: 'Website' })
  staff: string;

  @Column({ type: 'varchar', length: 100, default: 'Kenya Shilling' })
  currency: string;

  @Column({ type: 'varchar', length: 100, default: 'KES' })
  currency_symbol: string;

  @Column({ type: 'varchar', length: 200, default: '' })
  date: string;

  @Column({ type: 'int', default: 0 })
  status: number;

  @Column({ type: 'int', default: 0 })
  view: number;
}

@Entity({ name: 'quotation_items' })
export class QuotationItemRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  quote_id: number;

  @Column({ type: 'int', default: 0 })
  customer_id: number;

  @Column({ type: 'int', default: 0 })
  sale_status: number;

  @Column({ type: 'int', default: 0 })
  product_id: number;

  @Column({ type: 'varchar', length: 200 })
  product_name: string;

  @Column({ type: 'decimal', precision: 11, scale: 2 })
  unit_price: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'varchar', length: 20, default: 'pcs' })
  measure: string;

  @Column({ type: 'decimal', precision: 11, scale: 2 })
  sub_total: number;

  @Column({ type: 'decimal', precision: 11, scale: 2, default: 0 })
  unit_buying: number;

  @Column({ type: 'decimal', precision: 11, scale: 2, default: 0 })
  sub_buying: number;

  @Column({ type: 'text', default: '' })
  details: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  image: string;

  @Column({ type: 'varchar', length: 100, default: 'Website' })
  staff: string;

  @Column({ type: 'varchar', length: 100, default: '' })
  date: string;
}
