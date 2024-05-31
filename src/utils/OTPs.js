// import bcrypt from 'bcryptjs';
// import User from '../models/user';  // Adjust path as necessary
// import Otp from "../models/otpSchema";  // Adjust path as necessary

// export const verifyOtpAndResetPassword = async (req, res) => {
//   const { otp, newPassword, userId } = req.body;

//   try {
//     // Validate the OTP
//     const otpRecord = await Otp.findOne({ userId: userId, otp: otp });
//     if (!otpRecord || new Date() > new Date(otpRecord.expiresIn)) {
//       return res.status(400).json({ message: 'OTP is invalid or has expired' });
//     }

//     // Update the password
//     const hash = await bcrypt.hash(newPassword, 12);
//     await User.findByIdAndUpdate(userId, { password: hash });
//     await Otp.findByIdAndDelete(otpRecord._id);  // Delete OTP after use

//     res.status(200).json({ message: "Password has been reset successfully" });
//   } catch (error) {
//     console.error('Reset Password Error:', error);
//     res.status(500).json({ message: 'Failed to reset password' });
//   }
// };
