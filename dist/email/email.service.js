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
    staffOrderNotifyEmail;
    staffOrderNotifyCcEmail;
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
        this.staffOrderNotifyEmail =
            this.configService.get('ORDER_NOTIFY_EMAIL')?.trim() ||
                this.configService.get('ORDER_CC_EMAIL')?.trim() ||
                'tassmattagenciesltd@gmail.com';
        this.staffOrderNotifyCcEmail =
            this.configService.get('ORDER_NOTIFY_CC_EMAIL')?.trim() || 'bo9511221@gmail.com';
        console.log(`📧 Email service configured with from address: ${this.fromEmail}`);
        console.log(`📧 New-order staff notifications: ${this.staffOrderNotifyEmail}`);
        if (this.staffOrderNotifyCcEmail &&
            this.staffOrderNotifyCcEmail.toLowerCase() !== this.staffOrderNotifyEmail.toLowerCase()) {
            console.log(`📧 New-order staff notification CC: ${this.staffOrderNotifyCcEmail}`);
        }
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
    async sendNewOrderStaffNotification(orderData) {
        if (!this.resend) {
            console.warn('⚠️ Resend not initialized. Skipping staff new-order notification.');
            return;
        }
        if (!this.staffOrderNotifyEmail) {
            console.warn('⚠️ Staff notify email not configured. Skipping new-order notification.');
            return;
        }
        try {
            const html = this.generateStaffNewOrderEmail(orderData);
            const subject = `New order — ${orderData.orderNumber} (${orderData.customerName})`;
            const ccSameAsTo = this.staffOrderNotifyCcEmail &&
                this.staffOrderNotifyCcEmail.toLowerCase() ===
                    this.staffOrderNotifyEmail.toLowerCase();
            console.log('📧 Sending staff new-order notification...');
            console.log(`   To: ${this.staffOrderNotifyEmail}`);
            if (this.staffOrderNotifyCcEmail && !ccSameAsTo) {
                console.log(`   CC: ${this.staffOrderNotifyCcEmail}`);
            }
            console.log(`   Subject: ${subject}`);
            await this.resend.emails.send({
                from: this.fromEmail,
                to: this.staffOrderNotifyEmail,
                ...(this.staffOrderNotifyCcEmail && !ccSameAsTo
                    ? { cc: [this.staffOrderNotifyCcEmail] }
                    : {}),
                subject,
                html,
            });
            console.log('✅ Staff new-order notification sent.');
        }
        catch (error) {
            console.error('❌ Failed to send staff new-order notification:', error?.message || error);
        }
    }
    escapeHtml(s) {
        return String(s ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
    generateStaffNewOrderEmail(orderData) {
        const subtotal = this.toMoney(orderData.subtotal);
        const tax = this.toMoney(orderData.tax);
        const shipping = this.toMoney(orderData.shipping);
        const total = this.toMoney(orderData.total);
        const paymentMethodDisplay = orderData.paymentMethod === 'paystack'
            ? 'Paystack (online)'
            : orderData.paymentMethod === 'mpesa_paybill'
                ? 'M-Pesa Paybill'
                : orderData.paymentMethod === 'mpesa_stk'
                    ? 'M-Pesa STK (phone prompt)'
                    : 'Cash on delivery';
        const paymentStatusDisplay = orderData.paymentStatus === 'paid' ? 'Paid' : 'Pending';
        const rows = orderData.items
            .map((item) => {
            const line = this.toMoney(item.total);
            return `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${this.escapeHtml(item.productName)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">KES ${line.toFixed(2)}</td>
        </tr>`;
        })
            .join('');
        return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="background:#8B1538;padding:24px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:22px;">New order received</h1>
            <p style="color:#f0e0e4;margin:8px 0 0;font-size:14px;">A client submitted an order on the shop.</p>
          </td>
        </tr>
        <tr><td style="padding:28px;">
          <p style="color:#333;font-size:16px;margin:0 0 16px;"><strong>Order</strong> ${this.escapeHtml(orderData.orderNumber)}</p>
          <table width="100%" style="margin-bottom:20px;font-size:14px;color:#444;">
            <tr><td style="padding:4px 0;"><strong>Customer</strong></td><td>${this.escapeHtml(orderData.customerName)}</td></tr>
            <tr><td style="padding:4px 0;"><strong>Email</strong></td><td><a href="mailto:${encodeURIComponent(orderData.customerEmail)}">${this.escapeHtml(orderData.customerEmail)}</a></td></tr>
            ${orderData.customerPhone ? `<tr><td style="padding:4px 0;"><strong>Phone</strong></td><td>${this.escapeHtml(orderData.customerPhone)}</td></tr>` : ''}
            <tr><td style="padding:4px 0;"><strong>Total</strong></td><td style="font-weight:bold;color:#8B1538;">KES ${total.toFixed(2)}</td></tr>
            <tr><td style="padding:4px 0;"><strong>Payment</strong></td><td>${paymentMethodDisplay} — ${paymentStatusDisplay}</td></tr>
          </table>
          <h3 style="color:#1a1a1a;font-size:15px;margin:0 0 8px;">Items</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
            <thead>
              <tr style="background:#f8f9fa;">
                <th style="padding:8px;text-align:left;">Product</th>
                <th style="padding:8px;text-align:center;">Qty</th>
                <th style="padding:8px;text-align:right;">Line total</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <p style="color:#666;font-size:13px;margin:16px 0 0;">Subtotal KES ${subtotal.toFixed(2)} · Tax KES ${tax.toFixed(2)} · Shipping KES ${shipping.toFixed(2)}</p>
          <div style="background:#f8f9fa;padding:14px;border-radius:6px;margin-top:16px;">
            <strong style="color:#333;">Shipping address</strong>
            <p style="color:#555;margin:8px 0 0;white-space:pre-wrap;">${this.escapeHtml(orderData.shippingAddress || '—')}</p>
          </div>
          <p style="color:#999;font-size:12px;margin:24px 0 0;">Open the admin panel to manage this order.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
    }
    async sendQuotation(data) {
        if (!this.resend) {
            console.warn('⚠️ Resend not initialized. Cannot send quotation email.');
            return;
        }
        if (!data.customerEmail) {
            console.warn('⚠️ Quotation: customer email missing. Skipping.');
            return;
        }
        const html = this.generateQuotationEmail(data);
        await this.resend.emails.send({
            from: this.fromEmail,
            to: data.customerEmail,
            subject: `Quotation ${data.quotationRef} — Tassmatt`,
            html,
        });
        console.log(`✅ Quotation email sent to customer ${data.customerEmail}`);
        const staffTo = this.staffOrderNotifyEmail;
        if (staffTo) {
            const ccSame = this.staffOrderNotifyCcEmail &&
                this.staffOrderNotifyCcEmail.toLowerCase() === staffTo.toLowerCase();
            await this.resend.emails.send({
                from: this.fromEmail,
                to: staffTo,
                ...(this.staffOrderNotifyCcEmail && !ccSame
                    ? { cc: [this.staffOrderNotifyCcEmail] }
                    : {}),
                subject: `New quotation request — ${data.quotationRef} (${data.customerName})`,
                html,
            });
            console.log(`✅ Quotation staff copy sent to ${staffTo}`);
        }
    }
    generateQuotationEmail(data) {
        const validDays = data.validDays ?? 7;
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + validDays);
        const validUntilStr = validUntil.toLocaleDateString('en-KE', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
        const subtotal = this.toMoney(data.subtotal);
        const tax = this.toMoney(data.tax);
        const total = this.toMoney(data.total);
        const itemRows = data.items
            .map((item) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f0ebe8;font-size:14px;color:#333;">${this.escapeHtml(item.productName)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0ebe8;font-size:14px;color:#333;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0ebe8;font-size:14px;color:#333;text-align:right;">KES ${this.formatKes(this.toMoney(item.unitPrice))}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0ebe8;font-size:14px;color:#333;text-align:right;font-weight:600;">KES ${this.formatKes(this.toMoney(item.lineTotal))}</td>
      </tr>`)
            .join('');
        return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f5f0ee;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0ee;padding:32px 16px;">
  <tr><td align="center">
    <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

      <!-- Header -->
      <tr>
        <td style="background:#8B1538;padding:32px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <h1 style="margin:0;color:#ffffff;font-size:26px;letter-spacing:1px;">Tassmatt Agencies</h1>
              </td>
              <td align="right">
                <p style="margin:0;color:#f8e8ec;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Quotation</p>
                <p style="margin:4px 0 0;color:#ffffff;font-size:18px;font-weight:700;">${this.escapeHtml(data.quotationRef)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Meta row -->
      <tr>
        <td style="background:#fdf8f6;padding:20px 40px;border-bottom:1px solid #f0ebe8;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:50%;vertical-align:top;">
                <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;">Prepared for</p>
                <p style="margin:0;font-size:15px;font-weight:700;color:#1a1a1a;">${this.escapeHtml(data.customerName)}</p>
                <p style="margin:2px 0 0;font-size:13px;color:#555;">${this.escapeHtml(data.customerEmail)}</p>
                ${data.customerPhone ? `<p style="margin:2px 0 0;font-size:13px;color:#555;">${this.escapeHtml(data.customerPhone)}</p>` : ''}
                ${data.deliveryAddress ? `<p style="margin:6px 0 0;font-size:13px;color:#555;">${this.escapeHtml(data.deliveryAddress)}</p>` : ''}
              </td>
              <td style="width:50%;vertical-align:top;text-align:right;">
                <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;">Date issued</p>
                <p style="margin:0;font-size:14px;color:#333;">${new Date().toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                <p style="margin:12px 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;">Valid until</p>
                <p style="margin:0;font-size:14px;color:#8B1538;font-weight:700;">${validUntilStr}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Items table -->
      <tr>
        <td style="padding:32px 40px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <thead>
              <tr style="background:#8B1538;">
                <th style="padding:10px 12px;font-size:12px;color:#fff;text-align:left;text-transform:uppercase;letter-spacing:0.5px;border-radius:4px 0 0 0;">Description</th>
                <th style="padding:10px 12px;font-size:12px;color:#fff;text-align:center;text-transform:uppercase;letter-spacing:0.5px;">Qty</th>
                <th style="padding:10px 12px;font-size:12px;color:#fff;text-align:right;text-transform:uppercase;letter-spacing:0.5px;">Unit Price</th>
                <th style="padding:10px 12px;font-size:12px;color:#fff;text-align:right;text-transform:uppercase;letter-spacing:0.5px;border-radius:0 4px 0 0;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>
        </td>
      </tr>

      <!-- Totals -->
      <tr>
        <td style="padding:0 40px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#666;text-align:right;width:75%;">Subtotal (incl. VAT)</td>
              <td style="padding:6px 0 6px 16px;font-size:13px;color:#333;text-align:right;font-weight:600;">KES ${this.formatKes(subtotal)}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:12px;color:#999;text-align:right;">VAT (included @ 16%)</td>
              <td style="padding:4px 0 4px 16px;font-size:12px;color:#999;text-align:right;">KES ${this.formatKes(tax)}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:12px;color:#999;text-align:right;">Shipping / Delivery</td>
              <td style="padding:4px 0 4px 16px;font-size:12px;color:#999;text-align:right;">To be confirmed</td>
            </tr>
            <tr>
              <td colspan="2"><hr style="border:none;border-top:2px solid #8B1538;margin:10px 0;"/></td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:17px;font-weight:700;color:#8B1538;text-align:right;">Grand Total</td>
              <td style="padding:6px 0 6px 16px;font-size:17px;font-weight:700;color:#8B1538;text-align:right;">KES ${this.formatKes(total)}</td>
            </tr>
          </table>
        </td>
      </tr>

      ${data.notes ? `
      <!-- Notes -->
      <tr>
        <td style="padding:0 40px 24px;">
          <div style="background:#fdf8f6;border-left:4px solid #8B1538;padding:14px 18px;border-radius:0 6px 6px 0;">
            <p style="margin:0 0 4px;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;">Additional notes</p>
            <p style="margin:0;font-size:13px;color:#555;white-space:pre-wrap;">${this.escapeHtml(data.notes)}</p>
          </div>
        </td>
      </tr>` : ''}

      <!-- Terms -->
      <tr>
        <td style="padding:0 40px 32px;">
          <p style="margin:0;font-size:12px;color:#aaa;line-height:1.7;">
            This quotation is valid for <strong>${validDays} days</strong> from the date of issue.
            Prices are inclusive of VAT. Delivery charges will be confirmed separately.
            To accept and convert this to an order, reply to this email or contact us directly.
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#1a1a1a;padding:28px 40px;text-align:center;">
          <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">Tassmatt Agencies Ltd</p>
          <p style="margin:0 0 10px;font-size:12px;color:#aaa;">Premium Beverages &amp; More</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:0 12px;border-right:1px solid #444;">
                      <a href="mailto:orders@tassmatt.co.ke" style="color:#f0d0d8;font-size:12px;text-decoration:none;">orders@tassmatt.co.ke</a>
                    </td>
                    <td style="padding:0 12px;border-right:1px solid #444;">
                      <a href="tel:+254726410068" style="color:#f0d0d8;font-size:12px;text-decoration:none;">+254 726 410 068</a>
                    </td>
                    <td style="padding:0 12px;border-right:1px solid #444;">
                      <a href="https://wa.me/254726410068" style="color:#f0d0d8;font-size:12px;text-decoration:none;">WhatsApp</a>
                    </td>
                    <td style="padding:0 12px;">
                      <a href="https://shop.tassmatt.co.ke" style="color:#f0d0d8;font-size:12px;text-decoration:none;">shop.tassmatt.co.ke</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <p style="margin:14px 0 0;font-size:11px;color:#666;">Nairobi, Kenya &nbsp;|&nbsp; Mon – Sat 8 AM – 6 PM</p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
    }
    toMoney(value) {
        const n = typeof value === 'number' ? value : parseFloat(String(value ?? 0));
        return Number.isFinite(n) ? n : 0;
    }
    formatKes(value) {
        return value.toLocaleString('en-KE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }
    generateOrderConfirmationEmail(orderData) {
        const subtotal = this.toMoney(orderData.subtotal);
        const tax = this.toMoney(orderData.tax);
        const shipping = this.toMoney(orderData.shipping);
        const total = this.toMoney(orderData.total);
        const itemsHtml = orderData.items
            .map((item) => {
            const price = this.toMoney(item.price);
            const lineTotal = this.toMoney(item.total);
            return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.productName}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">KES ${price.toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">KES ${lineTotal.toFixed(2)}</td>
      </tr>
    `;
        })
            .join('');
        const paymentMethodDisplay = orderData.paymentMethod === 'paystack'
            ? 'Paystack (Online Payment)'
            : orderData.paymentMethod === 'mpesa_paybill'
                ? 'M-Pesa Paybill'
                : orderData.paymentMethod === 'mpesa_stk'
                    ? 'M-Pesa STK (Push)'
                    : 'Cash on Delivery';
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
                  <td style="padding: 8px 0; text-align: right; color: #1a1a1a; font-weight: bold;">KES ${subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666;">Tax:</td>
                  <td style="padding: 8px 0; text-align: right; color: #1a1a1a; font-weight: bold;">KES ${tax.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666666;">Shipping:</td>
                  <td style="padding: 8px 0; text-align: right; color: #1a1a1a; font-weight: bold;">KES ${shipping.toFixed(2)}</td>
                </tr>
                <tr style="border-top: 2px solid #ddd;">
                  <td style="padding: 12px 0; color: #1a1a1a; font-size: 18px; font-weight: bold;">Total:</td>
                  <td style="padding: 12px 0; text-align: right; color: #1a1a1a; font-size: 18px; font-weight: bold;">KES ${total.toFixed(2)}</td>
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