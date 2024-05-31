// Assuming you have a model to store OTPs
import otp from '../models/otpModel.js'; // Adjust the path to your actual OTP model
// import Otp from '../models/otpSchema.js';

// /**
//  * Verify if the provided OTP is correct and not expired
//  * @param {string} userId - The user's ID
//  * @param {string} otp - The one-time password provided by the user
//  * @returns {boolean} - Returns true if the OTP is correct and not expired, otherwise false
//  */
// export const verifyOtp = async (userId, otp) => {
//   const otpEntry = await Otp.findOne({ userId, otp });

//   if (!otpEntry) {
//     return false; // OTP not found or incorrect
//   }

//   // Check if the OTP is expired
//   const now = new Date();
//   if (otpEntry.expiresIn < now) {
//     return false; // OTP expired
//   }

//   return true; // OTP is valid and not expired
// };
