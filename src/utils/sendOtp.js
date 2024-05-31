// utils/sendOtp.js
import nodemailer from 'nodemailer';

export const sendOtp = async (email, otp) => {
  // Configure the email transporter
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // Change this to your email service provider if it's not Gmail
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS  // Your email password or app-specific password
    }
  });

  // Define the email options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,  // Ensure this is correctly passed
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}`
  };

  // Send the email
  try {
    console.log(`Sending OTP to: ${email}`); // Log to verify the recipient
    await transporter.sendMail(mailOptions);
    console.log('OTP sent successfully to', email);
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Error sending OTP');
  }
};
