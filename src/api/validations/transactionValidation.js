// src/validations/transactionValidation.js
import { z } from 'zod';

export const pinSchema = z.object({
  pin: z.string().min(4, "PIN must be at least 4 characters long").max(4, "PIN must be at most 4 characters long"),
});

// Reuse pinSchema in topUpSchema
export const topUpSchema = z.object({
  amount: z.number().positive("Amount must be positive."),
  currency: z.string().default('USD'),
  source: z.enum(['card', 'account']),
  pin: pinSchema.shape.pin, // Reuse pinSchema
  sourceDetails: z.object({
    bankName: z.string().min(1, "Bank name is required."),
    accountNumber: z.string().min(1, "Account number is required."),
  }).nonstrict()
});


export const withdrawSchema = z.object({
  amount: z.number().positive("Amount must be positive."),
  currency: z.string().default('USD'),
  source: z.enum(['card', 'account']),
  pin: pinSchema.shape.pin,
  sourceDetails: z.object({
    bankName: z.string().min(1, "Bank name is required."),
    accountNumber: z.string().min(1, "Account number is required."),
  }).nonstrict()
});



// export const transferSchema = z.object({
//   amount: z.number().positive(),
//   destinationType: z.enum(["wallet", "merchant"]),
//   destinationIdentifier: z.string().nonempty(),
//   description: z.string().optional(),
//   source: z.enum(["card", "account"]),
//   sourceDetails: z.object({
//     bankName: z.string().nonempty(),
//     accountNumber: z.string().nonempty()
//   })
// }).refine(data => {
//   if (data.destinationType === 'wallet') {
//     return z.string().email().safeParse(data.destinationIdentifier).success;
//   }
//   return true;
// }, {
//   message: "Must provide a valid email address for wallet transfers"
// });





// export const transferSchema = z.object({
//   amount: z.number().positive("Amount must be positive."),
//   currency: z.string().default('USD'),
//   fromUserId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectID"),
//   toUserId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectID").optional(),
//   destinationType: z.enum(["wallet", "merchant"]),
//   destinationIdentifier: z.string().min(1, "Destination identifier is required.")
// });

export const transferSchema = z.object({
  amount: z.number().positive("Amount must be positive."),
  destinationType: z.enum(["wallet", "merchant"]),
  destinationIdentifier: z.string().min(1, "Destination identifier is required.")
});



