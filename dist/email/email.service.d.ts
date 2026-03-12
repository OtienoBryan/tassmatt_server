import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private resend;
    private fromEmail;
    constructor(configService: ConfigService);
    sendOrderConfirmation(orderData: {
        orderNumber: string;
        customerEmail: string;
        customerName: string;
        items: Array<{
            productName: string;
            quantity: number;
            price: number;
            total: number;
        }>;
        subtotal: number;
        tax: number;
        shipping: number;
        total: number;
        shippingAddress: string;
        paymentMethod: string;
        paymentStatus: string;
    }): Promise<void>;
    private generateOrderConfirmationEmail;
}
