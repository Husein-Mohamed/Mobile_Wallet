import { z } from "zod";


export const verifyOtpSchema = z.object({
    otp: z.string().min(4, "OTP must be 6 digits").max(6, "OTP must be 6 digits")
  });