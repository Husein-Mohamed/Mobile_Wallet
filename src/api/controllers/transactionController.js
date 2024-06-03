import { Transaction } from '../../models/transecionModel.js';
import { User } from "../../models/userModel.js";
import { z } from 'zod';
import bcrypt from 'bcrypt';
// import { pinSchema } from '../validation/schemas';

// import {
//   withdrawalSchema,
//   transferValidationSchema,
//   updateTransactionSchema,
//   // topUpSchema
// } from "../validations/transactionValidation.js";
import { pinSchema, topUpSchema, transferSchema, withdrawSchema } from "../validations/transactionValidation.js";  // Ensure you import your schema
import { generateOtp, storeOtp } from '../../utils/generateOtp.js';
import sendEmail from '../../utils/emailService.js';
import { createResponse } from '../../utils/response.js';
import mongoose from 'mongoose';
import { logger } from '../../confic/confic.js';
// import sendOtpToWhatsapp from '../../utils/sendOtpToWhatsapp.js';



// src/controllers/transactionController.js


export const verifyPin = async (req, res) => {
  try {
    const { pin } = pinSchema.parse(req.body);
    const fromUserId = req.user.userId;  // Assuming the user ID is stored in req.user.id

    const user = await User.findById(fromUserId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPinMatch = await bcrypt.compare(pin, user.pin);  // Compare the provided PIN with the hashed PIN
    if (!isPinMatch) {
      return res.status(400).json({ message: "Invalid PIN" });
    }

    // Generate and store OTP
    const otp = generateOtp();
    await storeOtp(fromUserId, otp, 'topUp');

    // Send OTP to the user
    const emailOptions = {
      to: user.email,
      subject: 'Your OTP Code',
      text: `Your TopUp OTP code is ${otp}`,
    };

    await sendEmail(emailOptions);

    // Mark PIN as verified in the session
    req.session.isPinVerified = true;

    res.status(200).json({ message: "PIN verified. OTP sent to your email. Please verify to complete the transaction." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation failed", errors: error.errors });
    }
    res.status(500).json({ message: "Error verifying PIN", error: error.message });
  }
};


export const topUp = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const validationResult = topUpSchema.safeParse(req.body);
    const { success, error: parseErrors, data } = validationResult;

    if (!success) {
      const errors = parseErrors.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json(createResponse('error', 'Validation failed', { errors }));
    }

    const { amount, source, sourceDetails } = data;
    const fromUserId = req.user.userId; // Assuming the user ID is stored in req.user.userId

    const user = await User.findById(fromUserId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json(createResponse('error', 'User not found'));
    }

    if (amount <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json(createResponse('error', 'Amount must be positive'));
    }

    // Update the user's balance
    user.balance += amount;
    await user.save({ session });

    // Create a new transaction record
    const newTransaction = new Transaction({
      type: 'topUp',
      amount,
      fromUserId: fromUserId,
      status: 'completed',
      source,
      sourceDetails
    });
    await newTransaction.save({ session });

    logger.info(`TopUp: User ${user.email} topped up ${amount} from ${source} (${sourceDetails})`);

    // Prepare notification messages
    const message = `Your top-up of ${amount} from ${source} (${sourceDetails}) has been completed.`;

    // Send SMS notification
    // await sendSmsNotification(user.phoneNumber, message);

    // Send email notification
    const emailOptions = {
      to: user.email,
      subject: 'Top-Up Successful',
      text: message
    };
    await sendEmail(emailOptions);

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json(createResponse('success', 'Top-up successful', newTransaction));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error(`TopUp error: ${error.message}`);
    if (error instanceof z.ZodError) {
      return res.status(400).json(createResponse('error', 'Validation failed', { errors: error.errors }));
    }
    return res.status(500).json(createResponse('error', 'Error processing transaction', { error: error.message }));
  }
};

// export const withdraw = async (req, res) => {
//   try {
//     const validationResult = withdrawSchema.safeParse(req.body);
//     const { success, error: parseErrors, data } = validationResult;

//     if (!success) {
//       const errors = parseErrors.issues.map(issue => ({
//         field: issue.path.join('.'),
//         message: issue.message
//       }));
//       return res.status(400).json({ errors });
//     }

//     const { amount, destination, destinationDetails, pin } = data;
//     const fromUserId = req.user.userId;

//     const user = await User.findById(fromUserId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const isPinValid = await bcrypt.compare(pin, user.pin);
//     if (!isPinValid) {
//       return res.status(401).json({ message: "Invalid PIN" });
//     }

//     if (!user.email) {
//       return res.status(400).json({ message: "User does not have a valid email address" });
//     }

//     if (amount <= 0) {
//       return res.status(400).json({ message: "Amount must be positive" });
//     }

//     if (amount > user.balance) {
//       return res.status(400).json({ message: "Insufficient balance" });
//     }

//     const otp = generateOtp();
//     await storeOtp(user.email, otp, 'withdraw');

//     const emailOptions = {
//       to: user.email,
//       subject: 'Your Withdrawal OTP Code',
//       text: `Your OTP code is ${otp}. It expires in 10 minutes.`
//     };

//     await sendEmail(emailOptions);

//     req.session.withdrawDetails = { amount, destination, destinationDetails };

//     req.session.save((err) => {
//       if (err) {
//         return res.status(500).json({ message: "Error saving session", error: err.message });
//       }
//       res.status(200).json({ message: "OTP sent to your email. Please verify to complete the transaction." });
//     });
//   } catch (error) {
//     console.error("Error in withdraw:", error);
//     if (error instanceof z.ZodError) {
//       return res.status(400).json({ message: "Validation failed", errors: error.errors });
//     }
//     res.status(500).json({ message: "Error processing transaction", error: error.message });
//   }
// };

export const withdraw = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const validationResult = withdrawSchema.safeParse(req.body);
    const { success, error: parseErrors, data } = validationResult;

    if (!success) {
      const errors = parseErrors.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json(createResponse('error', 'Validation failed', { errors }));
    }

    const { amount, destination, destinationDetails } = data;
    const fromUserId = req.user.userId; // Assuming the user ID is stored in req.user.userId

    const user = await User.findById(fromUserId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json(createResponse('error', 'User not found'));
    }

    if (amount <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json(createResponse('error', 'Amount must be positive'));
    }

    if (amount > user.balance) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json(createResponse('error', 'Insufficient balance'));
    }

    // Update the user's balance
    user.balance -= amount;
    await user.save({ session });

    // Create a new transaction record
    const newTransaction = new Transaction({
      type: 'withdrawal',
      amount,
      fromUserId: fromUserId,
      status: 'completed',
      destination,
      destinationDetails
    });
    await newTransaction.save({ session });

    logger.info(`Withdrawal: User ${user.email} withdrew ${amount} to ${destination} (${destinationDetails})`);

    // Prepare notification messages
    const message = `Your withdrawal of ${amount} to ${destination} (${destinationDetails}) has been completed.`;

    // Send SMS notification
    // await sendSmsNotification(user.phoneNumber, message);

    // Send email notification
    const emailOptions = {
      to: user.email,
      subject: 'Withdrawal Successful',
      text: message
    };
    await sendEmail(emailOptions);

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json(createResponse('success', 'Withdrawal successful', newTransaction));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    logger.error(`Withdrawal error: ${error.message}`);
    if (error instanceof z.ZodError) {
      return res.status(400).json(createResponse('error', 'Validation failed', { errors: error.errors }));
    }
    return res.status(500).json(createResponse('error', 'Error processing transaction', { error: error.message }));
  }
};


// Handler for transfer transactions
// export const transfer = async (req, res) => {
//   try {
//     // Validate request body against schema
//     const validatedBody = transferSchema.parse(req.body);

//     const { amount, destinationType, destinationIdentifier } = validatedBody;
//     const fromUserId = req.user.userId;  // Assuming the user ID is stored in req.user.userId

//     // Find the sender user
//     const fromUser = await User.findById(fromUserId);
//     if (!fromUser) {
//       return res.status(404).json({ message: "Sender user not found" });
//     }

//     // Ensure the amount is positive (already validated by zod, technically redundant here)
//     if (amount <= 0) {
//       return res.status(400).json({ message: "Amount must be positive" });
//     }

//     let toUser;
//     if (destinationType === 'wallet') {
//       // Assume destinationIdentifier is an email for another user's wallet
//       toUser = await User.findOne({ email: destinationIdentifier.toLowerCase() });
//       if (!toUser) {
//         return res.status(404).json({ message: "Recipient user not found" });
//       }
//     } else if (destinationType === 'merchant') {
//       // Handle merchant logic here if applicable
//       // Placeholder: validation or retrieval of merchant details
//     }

//     if (fromUser.balance < amount) {
//       return res.status(400).json({ message: "Insufficient balance" });
//     }

//     fromUser.balance -= amount;
//     if (toUser && destinationType === 'wallet') {
//       toUser.balance += amount;
//       await toUser.save();
//     }

//     await fromUser.save();

//     const transactionData = {
//       type: 'transfer',
//       amount,
//       fromUserId: fromUser._id,
//       toUserId: toUser ? toUser._id : null,  // Only set for wallet transactions
//       destinationType,
//       destinationIdentifier,
//       status: 'completed'
//     };

//     const newTransaction = new Transaction(transactionData);
//     await newTransaction.save();

//     res.status(201).json(newTransaction);
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return res.status(400).json({ errors: error.flatten() });
//     }
//     res.status(500).json({ message: "Error processing transaction", error: error.message });
//   }
// };

export const transfer = async (req, res) => {
  try {
    // Check if PIN has been verified
    if (!req.session.isPinVerified) {
      return res.status(401).json({ message: "PIN not verified" });
    }

    // Validate request body against schema
    const validatedBody = transferSchema.parse(req.body);

    const { amount, destinationType, destinationIdentifier } = validatedBody;
    const fromUserId = req.user.userId;  // Assuming the user ID is stored in req.user.id

    // Find the sender user
    const fromUser = await User.findById(fromUserId);
    if (!fromUser) {
      return res.status(404).json({ message: "Sender user not found" });
    }

    // Ensure the amount is positive (already validated by zod, technically redundant here)
    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be positive" });
    }

    let toUser;
    if (destinationType === 'wallet') {
      // Assume destinationIdentifier is an email for another user's wallet
      toUser = await User.findOne({ email: destinationIdentifier.toLowerCase() });
      if (!toUser) {
        return res.status(404).json({ message: "Recipient user not found" });
      }
    } else if (destinationType === 'merchant') {
      // Handle merchant logic here if applicable
      // Placeholder: validation or retrieval of merchant details
    }

    if (fromUser.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    fromUser.balance -= amount;
    if (toUser && destinationType === 'wallet') {
      toUser.balance += amount;
      await toUser.save();
    }

    await fromUser.save();

    const transactionData = {
      type: 'transfer',
      amount,
      fromUserId: fromUser._id,
      toUserId: toUser ? toUser._id : null,  // Only set for wallet transactions
      destinationType,
      destinationIdentifier,
      status: 'completed'
    };

    const newTransaction = new Transaction(transactionData);
    await newTransaction.save();

    // Clear the PIN verification flag
    req.session.isPinVerified = false;

    res.status(201).json(newTransaction);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.flatten() });
    }
    res.status(500).json({ message: "Error processing transaction", error: error.message });
  }
};



export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ... other controllers ...

export const updateTransaction = async (req, res) => {
  const { transactionId } = req.params;
  // Assume that the validation schema checks for the appropriate fields
  const result = updateTransactionSchema.safeParse(req.body);
  
  if (!result.success) {
    return res.status(400).json({ errors: result.error.format() });
  }

  try {
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { transactionId: transactionId },
      { $set: result.data },
      { new: true }
    );

    if (!updatedTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(200).json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ message: 'Error updating transaction', error: error.message });
  }
};


export const deleteTransaction = async (req, res) => {
  const { transactionId } = req.params;

  try {
    const transaction = await Transaction.findOneAndDelete({ transactionId: transactionId });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Optionally, instead of deleting the record, you could update a 'deleted' flag
    // This is called a soft delete and can be useful for record-keeping and audits

    res.status(200).json({ message: 'Transaction successfully deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting transaction', error: error.message });
  }
};