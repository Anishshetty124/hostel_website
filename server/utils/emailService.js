const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send OTP email for password reset
 * @param {string} toEmail - Recipient email
 * @param {string} userName - User's first name
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise} - Resend API response
 */
const sendPasswordResetOTP = async (toEmail, userName, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Hostel Management <onboarding@resend.dev>',
      to: [toEmail],
      subject: 'Password Reset OTP - Hostel Management',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset OTP</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px 0; text-align: center;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Hostel Management</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: 600;">Password Reset Request</h2>
                      <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;">
                        Hi ${userName},
                      </p>
                      <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.5;">
                        We received a request to reset your password. Use the OTP code below to complete the process:
                      </p>
                      
                      <!-- OTP Box -->
                      <table role="presentation" style="width: 100%; margin: 0 0 30px;">
                        <tr>
                          <td style="text-align: center;">
                            <div style="display: inline-block; background-color: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px 40px;">
                              <span style="font-size: 36px; font-weight: 700; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                ${otp}
                              </span>
                            </div>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;">
                        This code will expire in <strong style="color: #333333;">10 minutes</strong>.
                      </p>
                      
                      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 0 0 20px; border-radius: 4px;">
                        <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
                          <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email or contact support if you're concerned about your account security.
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; text-align: center; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                      <p style="margin: 0 0 10px; color: #999999; font-size: 14px;">
                        Hostel Management System
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        This is an automated email. Please do not reply.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `Hi ${userName},\n\nWe received a request to reset your password.\n\nYour OTP code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\nHostel Management System`
    });

    if (error) {
      console.error('Resend API Error:', error);
      throw new Error('Failed to send email');
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };

  } catch (error) {
    console.error('Email Service Error:', error);
    throw error;
  }
};

/**
 * Send welcome email to new users
 * @param {string} toEmail - Recipient email
 * @param {string} userName - User's first name
 * @returns {Promise} - Resend API response
 */
const sendWelcomeEmail = async (toEmail, userName) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Hostel Management <onboarding@resend.dev>',
      to: [toEmail],
      subject: 'Welcome to Hostel Management System',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px 0; text-align: center;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Welcome to Hostel Management! 🎉</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">Hi ${userName}!</h2>
                      <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;">
                        Your account has been successfully created. You can now access all hostel management features including room details, food menu, laundry services, and more.
                      </p>
                      <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;">
                        If you have any questions, feel free to reach out to the hostel administration.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px; text-align: center; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                      <p style="margin: 0; color: #999999; font-size: 14px;">Hostel Management System</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('Resend API Error:', error);
      // Don't throw error for welcome emails - it shouldn't block registration
      return { success: false, error };
    }

    return { success: true, data };

  } catch (error) {
    console.error('Welcome Email Error:', error);
    return { success: false, error };
  }
};

const sendFeedbackEmail = async (toEmails, { subject, message, userName, userEmail }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Hostel Management <onboarding@resend.dev>',
      to: toEmails,
      subject: subject || 'New Feedback Received',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f4f4f4;">
          <table role="presentation" style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:32px 0;text-align:center;">
              <table role="presentation" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:10px;box-shadow:0 2px 6px rgba(0,0,0,0.08);">
                <tr>
                  <td style="padding:28px 32px;background:linear-gradient(135deg,#6366f1 0%,#7c3aed 100%);border-radius:10px 10px 0 0;color:#fff;text-align:left;">
                    <h1 style="margin:0;font-size:22px;font-weight:700;">New Feedback</h1>
                    <p style="margin:6px 0 0;font-size:14px;opacity:0.9;">From ${userName || 'User'} (${userEmail || 'not provided'})</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 32px;text-align:left;color:#111827;">
                    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#6b7280;letter-spacing:0.02em;">Subject</p>
                    <p style="margin:0 0 16px;font-size:16px;font-weight:700;color:#111827;">${subject || 'No subject'}</p>
                    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#6b7280;letter-spacing:0.02em;">Message</p>
                    <div style="margin:0 0 12px;padding:14px 16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;font-size:15px;line-height:1.6;color:#111827;white-space:pre-wrap;">
                      ${message?.replace(/</g,'&lt;')?.replace(/>/g,'&gt;') || 'No message provided'}
                    </div>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
      text: `New feedback from ${userName || 'User'} (${userEmail || 'not provided'})\nSubject: ${subject || 'No subject'}\n\n${message || 'No message provided'}`
    });

    if (error) {
      console.error('Resend API Error:', error);
      throw new Error('Failed to send feedback email');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Feedback Email Error:', error);
    throw error;
  }
};

module.exports = {
  sendPasswordResetOTP,
  sendWelcomeEmail,
  sendFeedbackEmail
};
