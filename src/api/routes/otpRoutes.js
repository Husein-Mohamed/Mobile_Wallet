import { Router } from 'express';
import { verifyOtpController, verifySignupOtp, verifyTopUpOtp, verifyWithdrawOtp } from '../controllers/otpController.js';
import authenticateToken from "../middlewares/authenticateToken.js";


const router = Router();

// Route to verify OTP
router.post('/verify-otp', verifyOtpController);


router.post('/verify-top-up', authenticateToken, verifyTopUpOtp);
router.post('/verify-withdraw-otp', authenticateToken, verifyWithdrawOtp);


router.post('/verify-signup-otp', verifySignupOtp);


export default router;