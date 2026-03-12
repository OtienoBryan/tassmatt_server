require('dotenv').config({ path: '.env' });
const { Resend } = require('resend');

async function sendTestOrderConfirmation() {
  console.log('🧪 Sending Test Order Confirmation Email\n');
  
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  const testEmail = 'bryanotieno09@gmail.com';
  
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY not found in .env file');
    console.error('   Please add RESEND_API_KEY=re_your_api_key to backend/.env');
    process.exit(1);
  }
  
  console.log('📋 Configuration:');
  console.log(`   From: ${fromEmail}`);
  console.log(`   To: ${testEmail}`);
  console.log(`   API Key: ${apiKey.substring(0, 10)}...`);
  console.log('');
  
  // Sample order data
  const orderData = {
    orderNumber: 'ORD-TEST-001',
    customerEmail: testEmail,
    customerName: 'Bryan Otieno',
    items: [
      {
        productName: 'Test Product 1',
        quantity: 2,
        price: 1500.00,
        total: 3000.00,
      },
      {
        productName: 'Test Product 2',
        quantity: 1,
        price: 2500.00,
        total: 2500.00,
      },
    ],
    subtotal: 5500.00,
    tax: 0.00,
    shipping: 500.00,
    total: 6000.00,
    shippingAddress: '123 Test Street, Nairobi, Kenya',
    paymentMethod: 'paystack',
    paymentStatus: 'paid',
  };
  
  // Generate email HTML (same as in email.service.ts)
  const itemsHtml = orderData.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.productName}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">KES ${item.price.toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">KES ${item.total.toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  const paymentMethodDisplay = orderData.paymentMethod === 'paystack' ? 'Paystack (Online Payment)' : 'Cash on Delivery';
  const paymentStatusDisplay = orderData.paymentStatus === 'paid' ? 'Paid' : 'Pending';

  const emailHtml = `
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
  
  try {
    console.log('📧 Sending email...');
    const resend = new Resend(apiKey);
    
    const result = await resend.emails.send({
      from: fromEmail,
      to: testEmail,
      subject: `Order Confirmation - ${orderData.orderNumber}`,
      html: emailHtml,
    });
    
    console.log('');
    console.log('✅ Email sent successfully!');
    console.log(`   Email ID: ${result.data?.id || 'N/A'}`);
    console.log(`   Sent to: ${testEmail}`);
    console.log(`   Order Number: ${orderData.orderNumber}`);
    console.log('');
    console.log('📬 Please check the inbox (and spam folder) for bryanotieno09@gmail.com');
    console.log('📊 You can also check the Resend dashboard: https://resend.com/emails');
    
  } catch (error) {
    console.error('');
    console.error('❌ Error sending email:');
    console.error(`   Error: ${error.message}`);
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, JSON.stringify(error.response.data, null, 2));
    }
    
    if (error.message.includes('Invalid API key')) {
      console.error('');
      console.error('💡 Solution:');
      console.error('   1. Verify your API key is correct');
      console.error('   2. Get a new API key from: https://resend.com/api-keys');
      console.error('   3. Make sure it starts with "re_"');
    } else if (error.message.includes('domain') || error.message.includes('from')) {
      console.error('');
      console.error('💡 Solution:');
      console.error('   1. Use Resend test domain: onboarding@resend.dev');
      console.error('   2. Or verify your domain in Resend dashboard');
      console.error('   3. Update RESEND_FROM_EMAIL in .env file');
    }
    
    process.exit(1);
  }
}

sendTestOrderConfirmation();
