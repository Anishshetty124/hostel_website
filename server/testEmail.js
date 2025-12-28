/**
 * Test Email Service
 * 
 * This script tests the email functionality.
 * Make sure to add your RESEND_API_KEY to .env before running.
 * 
 * Usage: node testEmail.js
 */

require('dotenv').config();
const { sendPasswordResetOTP, sendWelcomeEmail } = require('./utils/emailService');

async function testEmail() {
  try {
    console.log('🧪 Testing Email Service...\n');

    // Check if API key is set
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your_resend_api_key_here') {
      console.error('❌ Error: Please set RESEND_API_KEY in your .env file');
      console.log('\nSteps to fix:');
      console.log('1. Go to https://resend.com and sign up');
      console.log('2. Get your API key from the dashboard');
      console.log('3. Add it to server/.env as RESEND_API_KEY=re_...');
      process.exit(1);
    }

    // Get test email from command line or use default
    const testEmail = process.argv[2] || 'delivered@resend.dev';
    console.log(`📧 Sending test email to: ${testEmail}\n`);

    // Test Password Reset OTP
    console.log('Testing Password Reset Email...');
    const testOTP = '123456';
    const result = await sendPasswordResetOTP(testEmail, 'Test User', testOTP);
    
    if (result.success) {
      console.log('✅ Password Reset Email sent successfully!');
      console.log(`   Email ID: ${result.data.id}`);
    } else {
      console.log('❌ Failed to send Password Reset Email');
    }

    // Wait a bit before sending second email
    console.log('\nWaiting 2 seconds...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test Welcome Email
    console.log('Testing Welcome Email...');
    const welcomeResult = await sendWelcomeEmail(testEmail, 'Test User');
    
    if (welcomeResult.success) {
      console.log('✅ Welcome Email sent successfully!');
      console.log(`   Email ID: ${welcomeResult.data.id}`);
    } else {
      console.log('❌ Failed to send Welcome Email');
    }

    console.log('\n✨ Email service test completed!');
    console.log('\n📝 Notes:');
    console.log('- Free Resend accounts can only send to verified emails');
    console.log('- delivered@resend.dev is a test email that always works');
    console.log('- Check your email inbox for the test emails');
    console.log('- To test with your email, verify it in Resend dashboard first');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

// Run the test
testEmail();
