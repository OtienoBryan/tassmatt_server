import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Order, PaymentStatus } from '../entities/order.entity';
export declare function normalizeKenyaPhone(raw: string): string | null;
export declare class MpesaService {
    private readonly orderRepo;
    private readonly config;
    private readonly logger;
    constructor(orderRepo: Repository<Order>, config: ConfigService);
    private parseDarajaResponse;
    private darajaConfig;
    isConfigured(): boolean;
    getAccessToken(): Promise<string>;
    initiateStkPush(orderId: number, phoneNumber: string): Promise<{
        customerMessage: string;
        checkoutRequestId: string | undefined;
        merchantRequestId: string | undefined;
    }>;
    getOrderPaymentStatus(orderId: number, checkoutRequestId: string): Promise<{
        paymentStatus: PaymentStatus;
        orderNumber: string;
        mpesaReceiptNumber: string | null;
    } | null>;
    handleStkCallback(body: Record<string, unknown>): Promise<void>;
}
