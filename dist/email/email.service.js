"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resend_1 = require("resend");
let EmailService = class EmailService {
    configService;
    resend;
    fromEmail;
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('RESEND_API_KEY');
        if (!apiKey) {
            console.warn('⚠️ RESEND_API_KEY not found in environment variables. Email service will not work.');
            console.warn('⚠️ Please add RESEND_API_KEY to your .env file');
        }
        else {
            console.log('✅ Resend API key found, initializing email service...');
            this.resend = new resend_1.Resend(apiKey);
            console.log('✅ Email service initialized successfully');
        }
        this.fromEmail = this.configService.get('RESEND_FROM_EMAIL') || 'noreply@tassmatt.co.ke';
        console.log(`📧 Email service configured with from address: ${this.fromEmail}`);
    }
    async sendOrderConfirmation(orderData) {
        console.log('📧 Attempting to send order confirmation email...');
        console.log(`   Order Number: ${orderData.orderNumber}`);
        console.log(`   Customer Email: ${orderData.customerEmail}`);
        console.log(`   Customer Name: ${orderData.customerName}`);
        if (!this.resend) {
            console.error('❌ Resend not initialized. Cannot send email.');
            console.error('❌ Please check that RESEND_API_KEY is set in your .env file');
            return;
        }
        if (!orderData.customerEmail) {
            console.error('❌ Customer email is missing. Cannot send email.');
            return;
        }
        try {
            console.log('📧 Generating email HTML...');
            const emailHtml = this.generateOrderConfirmationEmail(orderData);
            console.log(`📧 Email HTML generated (${emailHtml.length} characters)`);
            console.log('📧 Sending email via Resend...');
            console.log(`   From: ${this.fromEmail}`);
            console.log(`   To: ${orderData.customerEmail}`);
            console.log(`   Subject: Order Confirmation - ${orderData.orderNumber}`);
            const result = await this.resend.emails.send({
                from: this.fromEmail,
                to: orderData.customerEmail,
                subject: `Order Confirmation - ${orderData.orderNumber}`,
                html: emailHtml,
            });
            console.log('');
            console.log('✅ Order confirmation email sent successfully!');
            console.log(`   Email ID: ${result.data?.id || 'N/A'}`);
            console.log(`   Sent to: ${orderData.customerEmail}`);
            console.log(`   Order: ${orderData.orderNumber}`);
            console.log(`   From: ${this.fromEmail}`);
            console.log('');
            return;
        }
        catch (error) {
            console.error('');
            console.error('❌ ERROR sending order confirmation email:');
            console.error(`   Error Type: ${error?.constructor?.name || 'Unknown'}`);
            console.error(`   Error Message: ${error?.message || 'Unknown error'}`);
            console.error(`   Error Name: ${error?.name || 'N/A'}`);
            if (error?.response) {
                console.error(`   Response Status: ${error.response?.status || 'N/A'}`);
                console.error(`   Response Status Text: ${error.response?.statusText || 'N/A'}`);
                console.error(`   Response Data:`, JSON.stringify(error.response?.data || {}, null, 2));
            }
            if (error?.request) {
                console.error(`   Request made but no response received`);
            }
            if (error?.stack) {
                console.error(`   Stack Trace:`, error.stack);
            }
            console.error(`   Full Error Object:`, JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
            console.error('');
        }
    }
    generateOrderConfirmationEmail(orderData) {
        const itemsHtml = orderData.items
            .map((item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.productName}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">KES ${item.price.toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">KES ${item.total.toFixed(2)}</td>
      </tr>
    `)
            .join('');
        const paymentMethodDisplay = orderData.paymentMethod === 'paystack' ? 'Paystack (Online Payment)' : 'Cash on Delivery';
        const paymentStatusDisplay = orderData.paymentStatus === 'paid' ? 'Paid' : 'Pending';
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Tassmatt</h1>
              <p style="color: #cccccc; margin: 10px 0 0 0; font-size: 16px;">Order Confirmation</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 24px;">Thank you for your order!</h2>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Dear ${orderData.customerName},
              </p>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                We've received your order and are processing it. Your order details are below:
              </p>
              
              <!-- Order Number -->
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
                <p style="margin: 0; color: #1a1a1a; font-size: 18px; font-weight: bold;">
                  Order Number: <span style="color: #007bff;">${orderData.orderNumber}</span>
                </p>
              </div>
              
              <!-- Order Items -->
              <h3 style="color: #1a1a1a; margin: 0 0 15px 0; font-size: 20px;">Order Items</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f8f9fa;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd; color: #1a1a1a;">Product</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd; color: #1a1a1a;">Quantity</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd; color: #1a1a1a;">Price</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd; color: #1a1a1a;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              
              <!-- Order Summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 8px 0; color: #666666;">Subtotal:</td>
                  <td style="padding: 8px 0; text-align: right; color: #1a1a1a; font-weight: bold;">KES ${orderData.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666;">Tax:</td>
                  <td style="padding: 8px 0; text-align: right; color: #1a1a1a; font-weight: bold;">KES ${orderData.tax.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666;">Shipping:</td>
                  <td style="padding: 8px 0; text-align: right; color: #1a1a1a; font-weight: bold;">KES ${orderData.shipping.toFixed(2)}</td>
                </tr>
                <tr style="border-top: 2px solid #ddd;">
                  <td style="padding: 12px 0; color: #1a1a1a; font-size: 18px; font-weight: bold;">Total:</td>
                  <td style="padding: 12px 0; text-align: right; color: #1a1a1a; font-size: 18px; font-weight: bold;">KES ${orderData.total.toFixed(2)}</td>
                </tr>
              </table>
              
              <!-- Shipping Address -->
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
                <h3 style="color: #1a1a1a; margin: 0 0 10px 0; font-size: 18px;">Shipping Address</h3>
                <p style="color: #666666; margin: 0; font-size: 16px; line-height: 1.6;">
                  ${orderData.shippingAddress}
                </p>
              </div>
              
              <!-- Payment Information -->
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
                <h3 style="color: #1a1a1a; margin: 0 0 10px 0; font-size: 18px;">Payment Information</h3>
                <p style="color: #666666; margin: 5px 0; font-size: 16px;">
                  <strong>Payment Method:</strong> ${paymentMethodDisplay}
                </p>
                <p style="color: #666666; margin: 5px 0; font-size: 16px;">
                  <strong>Payment Status:</strong> <span style="color: ${orderData.paymentStatus === 'paid' ? '#28a745' : '#ffc107'};">${paymentStatusDisplay}</span>
                </p>
              </div>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
                We'll send you another email when your order ships. If you have any questions, please don't hesitate to contact us.
              </p>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
                Best regards,<br>
                <strong>The Tassmatt Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #ddd;">
              <p style="color: #999999; font-size: 14px; margin: 0;">
                © ${new Date().getFullYear()} Tassmatt. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map