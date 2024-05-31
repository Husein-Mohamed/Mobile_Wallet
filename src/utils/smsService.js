// // /utils/smsService.js
// import twilio from 'twilio';

// const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// export const sendSms = async (to, message) => {
//   await twilioClient.messages.create({
//     body: message,
//     from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
//     to,
//   });
// };
