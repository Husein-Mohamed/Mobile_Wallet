
import express from "express";
import { requestPasswordReset, verifyOtpAndResetPassword } from "../controllers/passwordController.js";

const passwordRoutes = express.Router();



passwordRoutes.post('/password-reset-request', requestPasswordReset);
passwordRoutes.post('/reset-password', verifyOtpAndResetPassword);


export default passwordRoutes