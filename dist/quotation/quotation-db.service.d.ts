import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class QuotationDbService implements OnModuleInit, OnModuleDestroy {
    private readonly cfg;
    private readonly logger;
    private dataSource;
    constructor(cfg: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    saveQuotation(data: {
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
    }): Promise<void>;
}
