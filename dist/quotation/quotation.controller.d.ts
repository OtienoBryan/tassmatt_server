import { EmailService } from '../email/email.service';
import { QuotationDbService } from './quotation-db.service';
interface QuotationItemDto {
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
}
interface RequestQuotationDto {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    deliveryAddress?: string;
    notes?: string;
    items: QuotationItemDto[];
    subtotal: number;
    tax: number;
    total: number;
}
export declare class QuotationController {
    private readonly emailService;
    private readonly quotationDb;
    private readonly logger;
    constructor(emailService: EmailService, quotationDb: QuotationDbService);
    requestQuotation(body: RequestQuotationDto): Promise<{
        success: boolean;
        message: string;
        quotationRef?: undefined;
    } | {
        success: boolean;
        quotationRef: string;
        message?: undefined;
    }>;
}
export {};
