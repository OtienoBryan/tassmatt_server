# Resend Email Setup Guide

This guide will help you set up Resend email notifications for order confirmations.

## Prerequisites

1. A Resend account (sign up at https://resend.com)
2. A verified domain in Resend (or use Resend's test domain for development)

## Setup Steps

### 1. Get Your Resend API Key

1. Log in to your Resend account
2. Go to **API Keys** section
3. Click **Create API Key**
4. Give it a name (e.g., "Tassmatt Production" or "Tassmatt Development")
5. Copy the API key (it starts with `re_`)

### 2. Verify Your Domain (Optional but Recommended)

For production use, you should verify your domain:

1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `tassmatt.co.ke`)
4. Add the DNS records provided by Resend to your domain's DNS settings
5. Wait for verification (usually takes a few minutes)

### 3. Configure Environment Variables

Add the following to your `.env` file in the `backend` directory:

```env
# Resend Email Configuration
RESEND_API_KEY=re_your_actual_api_key_here
RESEND_FROM_EMAIL=noreply@tassmatt.co.ke
```

**Important Notes:**
- Replace `re_your_actual_api_key_here` with your actual Resend API key
- Replace `noreply@tassmatt.co.ke` with your verified domain email
- For development/testing, you can use Resend's test domain: `onboarding@resend.dev`

### 4. Test Email Sending

After configuring, test by placing an order. The system will automatically send an order confirmation email to the customer's email address.

## Email Features

The order confirmation email includes:
- Order number
- Customer name
- List of ordered items with quantities and prices
- Order summary (subtotal, tax, shipping, total)
- Shipping address
- Payment method and status
- Professional HTML formatting

## Troubleshooting

### Email Not Sending

1. **Check API Key**: Ensure `RESEND_API_KEY` is set correctly in your `.env` file
   - Run `npm run test:email` to test your configuration
   - The API key should start with `re_`
   
2. **Check From Email**: Ensure `RESEND_FROM_EMAIL` uses a verified domain
   - For testing: Use `onboarding@resend.dev`
   - For production: Use your verified domain email
   
3. **Check Logs**: Look for email-related errors in the backend console
   - Look for messages starting with `📧` or `❌`
   - Check for "Resend not initialized" warnings
   
4. **Test Email Configuration**: Run the test script
   ```bash
   npm run test:email
   ```
   
5. **Resend Dashboard**: Check the Resend dashboard for delivery status and errors
   - Go to https://resend.com/emails
   - Check for failed deliveries or API errors

### Common Issues

- **"Invalid API Key"**: Your API key is incorrect or expired
  - Get a new API key from https://resend.com/api-keys
  - Make sure it starts with `re_`
  
- **"Domain not verified"**: Use a verified domain or Resend's test domain
  - For development: Use `onboarding@resend.dev`
  - For production: Verify your domain in Resend dashboard
  
- **"Email not delivered"**: Check spam folder or verify recipient email address
  - Test with `delivered@resend.dev` first
  - Check Resend dashboard for delivery status
  
- **"Resend not initialized"**: API key not found in environment
  - Check `.env` file exists in `backend` directory
  - Verify `RESEND_API_KEY` is set correctly
  - Restart the backend server after adding the key

### Debugging Steps

1. **Check Environment Variables**:
   ```bash
   # In backend directory
   cat .env | grep RESEND
   ```

2. **Check Backend Logs**:
   - Look for initialization messages when server starts
   - Look for email sending attempts when orders are created
   - Check for error messages with details

3. **Test Email Service**:
   ```bash
   npm run test:email
   ```

4. **Verify Order Creation**:
   - Check that orders are being created successfully
   - Verify customer email is included in order data
   - Check console logs for email sending attempts

## Development vs Production

### Development
- Use Resend's test domain: `onboarding@resend.dev`
- Emails are sent but may not be delivered to all providers
- Good for testing email templates

### Production
- Use your verified domain
- Better deliverability
- Professional appearance

## Additional Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend API Reference](https://resend.com/docs/api-reference)
- [Email Best Practices](https://resend.com/docs/send-emails/best-practices)
