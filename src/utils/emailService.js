import nodemailer from 'nodemailer';
import { emailPass, emailUser } from '../confic/confic.js';

const sendEmail = async ({ to, subject, text }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser, // This should be a valid Gmail email address
      pass: emailPass, // This should be the corresponding password or App Password if 2FA is enabled
    },
  });

  const mailOptions = {
    from: emailUser, // Make sure this environment variable is set, or use emailUser from your config
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Rethrow the error so the caller is aware that email sending failed
  }
};

export default sendEmail

