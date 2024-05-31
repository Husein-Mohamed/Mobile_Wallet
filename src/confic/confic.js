
import dotenv from 'dotenv';
dotenv.config();


export const jwtSecret = process.env.JWT_SECRET


const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

export { emailUser, emailPass };


const accountSid=  process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER

export { accountSid, authToken, TWILIO_WHATSAPP_NUMBER }


export const CLOUDINARY_CLOUD_MANE = process.env.CLOUDINARY_CLOUD_MANE
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET