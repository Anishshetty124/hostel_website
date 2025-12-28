const { sendFeedbackEmail } = require('../utils/emailService');

// @desc Send feedback email to admin and fixed address
// @route POST /api/feedback
// @access Private (logged-in users)
const sendFeedback = async (req, res) => {
  const { subject, message } = req.body || {};

  if (!subject || !subject.trim() || !message || !message.trim()) {
    return res.status(400).json({ message: 'Subject and message are required.' });
  }

  try {
    const userName = req.user?.firstName || 'User';
    const userEmail = req.user?.email || 'Not provided';

    const adminEmail = process.env.ADMIN_EMAIL;
    const staticEmail = 'anishshetty124@gmail.com';

    const recipients = [adminEmail, staticEmail].filter(Boolean);
    if (recipients.length === 0) {
      return res.status(500).json({ message: 'No admin email configured.' });
    }

    await sendFeedbackEmail(recipients, {
      subject: subject.trim(),
      message: message.trim(),
      userName,
      userEmail,
    });

    return res.json({ message: 'Feedback sent successfully' });
  } catch (err) {
    console.error('sendFeedback error:', err);
    return res.status(500).json({ message: 'Failed to send feedback' });
  }
};

module.exports = { sendFeedback };
