// import generateOtp from '../utils/generateOtp.js';
import { User } from '../../models/userModel.js';
import { generateOtp, storeOtp, verifyOtp } from '../../utils/generateOtp.js'
// import generateOtp from '../../utils/generateOtp.js';
import sendEmail from '../../utils/emailService.js';
// import storeOtp from '../../utils/storeOtp.js';
import Otp from '../../models/otpSchema.js';

export const requestPasswordReset = async (req, res) => {
    const { contact, method } = req.body; // `contact` can be an email or phone number; `method` can be 'email' or 'sms'
  
    try {
      const user = method === 'email' 
        ? await User.findOne({ email: contact }) 
        : await User.findOne({ phoneNumber: contact });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const otp = generateOtp(6); // Generates a 6-digit OTP
      await storeOtp(user._id, otp); // Stores the OTP along with userId in the database
  
      if (method === 'email') {
        const emailOptions = {
          to: user.email,
          subject: 'Password Reset Request',
          text: `You requested to reset your password. Here's your OTP: ${otp}. It will expire in 15 minutes.`
        };
        await sendEmail(emailOptions);
        res.status(200).json({ message: "OTP sent to your email." });
      } else {
        // Placeholder for SMS sending logic
        res.status(501).json({ message: "SMS service is not implemented yet." });
      }
    } catch (error) {
      console.error('Password Reset Request Error:', error);
      res.status(500).json({ message: 'Unable to process password reset request' });
    }
  };

export const verifyOtpAndResetPassword = async (req, res) => {
  const { otp, newPassword, contact, method } = req.body;

  try {
    const user = method === 'email' 
      ? await User.findOne({ email: contact }) 
      : await User.findOne({ phoneNumber: contact });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate the OTP
    const otpRecord = await Otp.findOne({ userId: user._id, otp: otp });
    if (!otpRecord || new Date() > new Date(otpRecord.expiresIn)) {
      return res.status(400).json({ message: 'OTP is invalid or has expired' });
    }

    // Update the password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });
    await Otp.findByIdAndDelete(otpRecord._id);  // Delete OTP after use

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error('Verify OTP and Reset Password Error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};
