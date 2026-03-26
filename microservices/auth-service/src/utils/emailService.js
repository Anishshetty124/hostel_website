const { Resend } = require('resend');

let resendClient = null;

const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }

  return resendClient;
};

const sendPasswordResetOTP = async (toEmail, userName, otp) => {
  const resend = getResendClient();
  if (!resend) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'Hostel Management <onboarding@resend.dev>',
    to: [toEmail],
    subject: 'Password Reset OTP - Hostel Management',
    html: `<p>Hi ${userName},</p><p>Your OTP is <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
    text: `Hi ${userName}, Your OTP is ${otp}. It expires in 10 minutes.`,
  });

  if (error) {
    throw new Error('Failed to send email');
  }

  return { success: true, data };
};

module.exports = { sendPasswordResetOTP };
