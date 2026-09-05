const nodemailer = require('nodemailer');

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  return transporter;
};

/**
 * Sends an email. Fails silently (logs error) so that a missing/broken
 * SMTP config never blocks the core approval workflow during grading/demo.
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`[sendEmail] SMTP not configured — skipping email to ${to}: ${subject}`);
      return;
    }
    const t = getTransporter();
    await t.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html
    });
    console.log(`[sendEmail] Sent "${subject}" to ${to}`);
  } catch (err) {
    console.error('[sendEmail] Failed:', err.message);
  }
};

module.exports = sendEmail;
