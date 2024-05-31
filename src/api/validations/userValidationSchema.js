import { object, string, z } from 'zod';

// export const signupValidationSchema = object({
//   fullName: string().min(1, { message: "Full name is required" }).trim(),
//   phoneNumber: string().min(1, { message: "Phone number is required" }).trim(),
//   email: string().email("Invalid email address").trim().transform(str => str.toLowerCase()),
//   password: string().min(6, { message: "Password must be at least 6 characters long" }),
//   // Add your confirmPassword logic here as needed
//   confirmPassword: string(),
// }).refine((data) => data.password === data.confirmPassword, {
//   message: "Passwords do not match",
//   path: ["confirmPassword"], // This indicates where the error should be associated in the validation result
// });

export const signupValidationSchema = object({
  fullName: z.string().min(1, { message: "Full name is required" }).trim(),
  phoneNumber: z.string().min(1, { message: "Phone number is required" }).trim(),
  email: z.string().email("Invalid email address").trim().transform(str => str.toLowerCase()),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  confirmPassword: z.string(),
  // pin: z.string().min(4, { message: "PIN must be at least 4 characters long" }).max(4, { message: "PIN must be at most 4 characters long" }), // Add pin validation
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"], // This indicates where the error should be associated in the validation result
});

export const setupPinSchema = z.object({
  pin: z.string().min(4, "PIN must be at least 4 digits").max(4, "PIN must be at most 4 digits")
});


export const updateProfileValidationSchema = object({
  fullName: string()
    .min(1, { message: "Full name is required" })
    .trim(),
  email: string()
    .email({ message: "Invalid email address" })
    .trim()
    .transform(str => str.toLowerCase()),
});
