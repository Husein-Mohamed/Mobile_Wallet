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
// import sendOtpToWhatsapp from '../../utils/sendOtpToWhatsapp.js';



// src/controllers/transactionController.js

// Handler for top-up transactions


// export const verifyPin = async (req, res) => {
//   try {
//     const { pin } = pinSchema.parse(req.body);
//     const fromUserId = req.user.userId;  // Assuming the user ID is stored in req.user.id

//     const user = await User.findById(fromUserId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const isMatch = await bcrypt.compare(pin, user.pin);  // Compare the provided PIN with the hashed PIN
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid PIN" });
//     }

//     // Retrieve the pending transaction ID from the session
//     const transactionId = req.session.transactionId;
//     if (!transactionId) {
//       return res.status(400).json({ message: "No pending transaction found" });
//     }

//     // Find the pending transaction
//     const transaction = await Transaction.findById(transactionId);
//     if (!transaction || transaction.status !== 'pending') {
//       return res.status(404).json({ message: "Pending transaction not found" });
//     }

//     // Complete the transaction
//     user.balance += transaction.amount;
//     transaction.status = 'completed';

//     await user.save();
//     await transaction.save();

//     // Clear the transaction ID from the session
//     req.session.transactionId = null;

//     res.status(200).json({ message: "PIN verified and transaction completed", transaction });
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return res.status(400).json({ message: "Validation failed", errors: error.errors });
//     }
//     res.status(500).json({ message: "Error verifying PIN and completing transaction", error: error.message });
//   }
// };

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
  try {
    const validationResult = topUpSchema.safeParse(req.body);
    const { success, error: parseErrors, data } = validationResult;

    if (!success) {
      const errors = parseErrors.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      return res.status(400).json({ errors });
    }

    const { amount, source, sourceDetails, pin } = data;
    const fromUserId = req.user.userId; // Assuming the user ID is stored in req.user.id

    const user = await User.findById(fromUserId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify the PIN
    const isPinValid = await bcrypt.compare(pin, user.pin);
    if (!isPinValid) {
      return res.status(401).json({ message: "Invalid PIN" });
    }

    if (!user.email) {
      return res.status(400).json({ message: "User does not have a valid email address" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be positive" });
    }

    // Generate and store OTP
    const otp = generateOtp();
    await storeOtp(fromUserId, otp, 'topUp');

    // Send OTP to the user
    const emailOptions = {
      to: user.email,
      subject: 'Your TopUp OTP Code',
      text: `Your  OTP code is ${otp}. It expires in 10 minutes.`
    };

    await sendEmail(emailOptions);

    // Store top-up details in session
    req.session.topUpDetails = { amount, source, sourceDetails };

    // Make sure the session is saved before sending the response
    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ message: "Error saving session", error: err.message });
      }
      res.status(200).json({ message: "OTP sent to your email. Please verify to complete the transaction." });
    });
  } catch (error) {
    console.error("Error in topUp:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation failed", errors: error.errors });
    }
    res.status(500).json({ message: "Error processing transaction", error: error.message });
  }
};


// export const withdraw = async (req, res) => {
//   try {
//     // Check if PIN has been verified
//     if (!req.session.isPinVerified) {
//       return res.status(401).json({ message: "PIN not verified" });
//     }

//     // Validate request body against schema
//     const validatedBody = withdrawSchema.parse(req.body);

//     const { amount, currency, source, sourceDetails } = validatedBody;
//     const fromUserId = req.user.userId;  // Assuming the user ID is stored in req.user.id

//     // Find the sender user
//     const fromUser = await User.findById(fromUserId);
//     if (!fromUser) {
//       return res.status(404).json({ message: "Sender user not found" });
//     }

//     // Ensure the amount is positive (already validated by zod, technically redundant here)
//     if (amount <= 0) {
//       return res.status(400).json({ message: "Amount must be positive" });
//     }

//     if (fromUser.balance < amount) {
//       return res.status(400).json({ message: "Insufficient balance" });
//     }

//     fromUser.balance -= amount;
//     await fromUser.save();

//     const newTransaction = new Transaction({
//       type: 'withdrawal',
//       amount,
//       fromUserId: fromUser._id,
//       currency,
//       source,
//       sourceDetails,
//       status: 'completed'
//     });
//     await newTransaction.save();

//     // Clear the PIN verification flag
//     req.session.isPinVerified = false;

//     res.status(201).json(newTransaction);
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return res.status(400).json({ errors: error.flatten() });
//     }
//     res.status(500).json({ message: "Error processing transaction", error: error.message });
//   }
// };

export const withdraw = async (req, res) => {
  try {
    const validationResult = withdrawSchema.safeParse(req.body);
    const { success, error: parseErrors, data } = validationResult;

    if (!success) {
      const errors = parseErrors.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      return res.status(400).json({ errors });
    }

    const { amount, destination, destinationDetails, pin } = data;
    const fromUserId = req.user.userId; // Assuming the user ID is stored in req.user.userId

    const user = await User.findById(fromUserId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPinValid = await bcrypt.compare(pin, user.pin);
    if (!isPinValid) {
      return res.status(401).json({ message: "Invalid PIN" });
    }

    if (!user.email) {
      return res.status(400).json({ message: "User does not have a valid email address" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be positive" });
    }

    if (amount > user.balance) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const otp = generateOtp();
    await storeOtp(user.email, otp, 'withdraw');

    const emailOptions = {
      to: user.email,
      subject: 'Your Withdrawal OTP Code',
      text: `Your OTP code is ${otp}. It expires in 10 minutes.`
    };

    await sendEmail(emailOptions);

    req.session.withdrawDetails = { amount, destination, destinationDetails };

    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ message: "Error saving session", error: err.message });
      }
      res.status(200).json({ message: "OTP sent to your email. Please verify to complete the transaction." });
    });
  } catch (error) {
    console.error("Error in withdraw:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation failed", errors: error.errors });
    }
    res.status(500).json({ message: "Error processing transaction", error: error.message });
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






// export const createTransaction = async (req, res) => {
//   const {
//     type,
//     amount,
//     currency,
//     fromUserId,
//     destinationType,
//     destinationIdentifier
//   } = req.body;

//   try {
//     // Log the user ID extracted from the authentication token
//     console.log("User ID from JWT:", req.user.userId);

//     // Retrieve the current user based on the user ID extracted from the authentication token
//     const currentUser = await User.findById(req.user.userId);

//     // Log the current user's email
//     console.log("Current user email:", currentUser.email);

//     // Check if the destination type is "wallet" and verify the email exists
//     if (destinationType === "wallet") {
//       const recipient = await User.findOne({ email: destinationIdentifier });

//       // Log the recipient's email
//       console.log("Recipient email:", recipient.email);

//       // Check if recipient exists
//       if (!recipient) {
//         return res.status(404).json({ message: "No user found with the provided email." });
//       }

//       // Check if the recipient's user ID matches the authenticated user's user ID
//   if (recipient._id.toString() === currentUser._id.toString()) {
//     return res.status(403).json({ message: "You can't transfer funds to yourself." });
//   }
// }

//     // Create and save the transaction
//     const newTransaction = new Transaction({
//       type,
//       amount,
//       currency,
//       fromUserId,
//       destinationType,
//       destinationIdentifier,
//       status: "pending"
//     });

//     const savedTransaction = await newTransaction.save();
//     res.status(201).json(savedTransaction);
//   } catch (error) {
//     console.error('Error creating the transaction:', error);
//     res.status(400).json({ message: 'Failed to create the transaction', error: error.message });
//   }
// };




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