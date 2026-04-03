import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private resend;
    private fromEmail;
    private staffOrderNotifyEmail;
    private staffOrderNotifyCcEmail;
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
    sendNewOrderStaffNotification(orderData: {
        orderNumber: string;
        customerName: string;
        customerEmail: string;
        customerPhone?: string;
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
    private escapeHtml;
    private generateStaffNewOrderEmail;
    private toMoney;
    private generateOrderConfirmationEmail;
}
