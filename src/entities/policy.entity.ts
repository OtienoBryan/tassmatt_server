import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum PolicyType {
  TERMS_CONDITIONS = 'terms_conditions',
  PRIVACY_POLICY = 'privacy_policy',
  SHIPPING_POLICY = 'shipping_policy',
  REFUND_RETURN = 'refund_return',
  COOKIE_POLICY = 'cookie_policy',
  DISCLAIMER = 'disclaimer',
}

@Entity('policies')
export class Policy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: PolicyType })
  type: PolicyType;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
