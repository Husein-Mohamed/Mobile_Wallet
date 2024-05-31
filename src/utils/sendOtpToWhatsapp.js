
import twilio from 'twilio';
import { accountSid, authToken } from '../confic/confic.js';

const client = twilio(accountSid, authToken);

const sendOtpToWhatsapp = async (userWhatsappNumber, otp) => {
  try {
    const message = await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: process.env.TWILIO_WHATSAPP_NUMBER, // Your Twilio WhatsApp number in format 'whatsapp:+1234567890'
      to: `whatsapp:${userWhatsappNumber}` // User's WhatsApp number in format 'whatsapp:+1234567890'
    });

    console.log(`Message sent successfully to ${userWhatsappNumber}. SID: ${message.sid}`);
  } catch (error) {
    console.error('Failed to send OTP via WhatsApp:', error);
  }
};

export default sendOtpToWhatsapp;