import { MpesaService } from './mpesa.service';
export declare class MpesaController {
    private readonly mpesaService;
    private readonly logger;
    constructor(mpesaService: MpesaService);
    stkConfigured(): {
        configured: boolean;
    };
    stkPush(body: {
        orderId?: unknown;
        phoneNumber?: unknown;
    }): Promise<{
        customerMessage: string;
        checkoutRequestId: string | undefined;
        merchantRequestId: string | undefined;
    }>;
    orderPaymentStatus(orderIdRaw: string, checkoutRequestId: string): Promise<{
        paymentStatus: import("../entities").PaymentStatus;
        orderNumber: string;
        mpesaReceiptNumber: string | null;
    }>;
    stkCallback(body: Record<string, unknown>): Promise<{
        ResultCode: number;
        ResultDesc: string;
    }>;
}
