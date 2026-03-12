require('dotenv').config({ path: '.env' });
const { Resend } = require('resend');

async function testEmail() {
  console.log('🧪 Testing Resend Email Configuration\n');
  
  // Check environment variables
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@tassmatt.co.ke';
  
  console.log('📋 Configuration Check:');
  console.log(`   RESEND_API_KEY: ${apiKey ? '✅ Found' : '❌ Missing'}`);
  console.log(`   RESEND_FROM_EMAIL: ${fromEmail}`);
  console.log('');
  
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY is not set in .env file');
    console.error('   Please add RESEND_API_KEY=re_your_api_key to your .env file');
    console.error('   Get your API key from: https://resend.com/api-keys');
    process.exit(1);
  }
  
  if (!apiKey.startsWith('re_')) {
    console.warn('⚠️  RESEND_API_KEY should start with "re_"');
    console.warn('   Please verify your API key is correct');
  }
  
  try {
    console.log('🔌 Initializing Resend client...');
    const resend = new Resend(apiKey);
    
    console.log('📧 Attempting to send test email...');
    console.log(`   From: ${fromEmail}`);
    console.log(`   To: test@example.com (this is just a test)`);
    console.log('');
    
    // Try to send a test email
    const result = await resend.emails.send({
      from: fromEmail,
      to: 'delivered@resend.dev', // Resend's test email address
      subject: 'Test Email from Tassmatt',
      html: '<h1>Test Email</h1><p>This is a test email to verify Resend configuration.</p>',
    });
    
    console.log('✅ Email sent successfully!');
    console.log(`   Email ID: ${result.data?.id || 'N/A'}`);
    console.log('');
    console.log('📝 Note: The email was sent to delivered@resend.dev (Resend test address)');
    console.log('   Check your Resend dashboard to see if it was delivered');
    console.log('');
    console.log('✅ Resend configuration is working correctly!');
    
  } catch (error) {
    console.error('❌ Error sending test email:');
    console.error(`   Error: ${error.message}`);
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, JSON.stringify(error.response.data, null, 2));
    }
    
    if (error.message.includes('Invalid API key')) {
      console.error('');
      console.error('💡 Solution:');
      console.error('   1. Verify your API key is correct');
      console.error('   2. Check that the API key starts with "re_"');
      console.error('   3. Get a new API key from: https://resend.com/api-keys');
    } else if (error.message.includes('domain')) {
      console.error('');
      console.error('💡 Solution:');
      console.error('   1. Verify your domain in Resend dashboard');
      console.error('   2. Or use Resend test domain: onboarding@resend.dev');
      console.error('   3. Update RESEND_FROM_EMAIL in .env file');
    }
    
    process.exit(1);
  }
}

testEmail();
