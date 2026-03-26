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

const sendFeedbackEmail = async (toEmails, { subject, message, userName, userEmail }) => {
  const resend = getResendClient();
  if (!resend) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'Hostel Management <onboarding@resend.dev>',
    to: toEmails,
    subject: subject || 'New Feedback Received',
    html: `
      <h2>New Feedback</h2>
      <p><strong>From:</strong> ${userName || 'User'} (${userEmail || 'not provided'})</p>
      <p><strong>Subject:</strong> ${subject || 'No subject'}</p>
      <p><strong>Message:</strong></p>
      <pre style="white-space: pre-wrap;">${message?.replace(/</g, '&lt;')?.replace(/>/g, '&gt;') || 'No message provided'}</pre>
    `,
    text: `New feedback from ${userName || 'User'} (${userEmail || 'not provided'})\nSubject: ${subject || 'No subject'}\n\n${message || 'No message provided'}`,
  });

  if (error) {
    throw new Error('Failed to send feedback email');
  }

  return { success: true, data };
};

module.exports = { sendFeedbackEmail };
