import { z } from 'zod';
// import { generateJwtToken } from '../../utils/generateJwtToken.js';
import { verifyOtp } from '../../utils/generateOtp.js';
import { topUpSchema } from '../validations/transactionValidation.js';
import { User } from '../../models/userModel.js';
import { Transaction } from '../../models/transecionModel.js';
import bcrypt from 'bcrypt';
import { verifyOtpSchema } from '../validations/OTPValidation.js';
import { createResponse } from '../../utils/response.js';
import jwt from 'jsonwebtoken';
import { jwtSecret } from '../../confic/confic.js';


// export const verifyOtpController = async (req, res) => {
//   const { userId, otp,purpose } = req.body;

//   try {
//     const isValid = await verifyOtp(userId, otp,purpose);
//     if (!isValid) {
//       return res.status(401).send("Invalid OTP");
//     }

//     // OTP is valid, generate the JWT
//     const token = generateJwtToken(userId);

//     // Set the JWT as a secure, HTTP-only cookie in the response
//     res.cookie('jwt', token, {
//       httpOnly: true,
//       secure: false, // Change to `true` in production
//       maxAge: 3600000,  // Expires in 1 hour
//       sameSite: 'strict'
//     });

//     res.status(200).send({ message: "Authentication successful", token });
//   } catch (error) {
//     console.error("OTP Verification Error:", error);
//     res.status(500).send("Error during OTP verification");
//   }
// };


// export const verifySignupOtp = async (req, res) => {
//   const { email, otp, fullName, phoneNumber, password } = req.body;

//   try {
//     const isOtpValid = await verifyOtp(email, otp, 'signup');  // Using email as the identifier for OTP

//     if (!isOtpValid) {
//       return res.status(400).json(createResponse('error', 'Invalid or expired OTP'));
//     }

//     const existingUser = await User.findOne({
//       $or: [{ email: email.toLowerCase() }, { phoneNumber }]
//     });

//     if (existingUser) {
//       const field = existingUser.email === email.toLowerCase() ? "Email" : "Phone number";
//       return res.status(409).json(createResponse('error', `${field} already exists.`));
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = new User({
//       fullName,
//       phoneNumber,
//       email: email.toLowerCase(),
//       password: hashedPassword,
//     });

//     await newUser.save();

//     res.status(201).json(createResponse('success', 'User created successfully'));
//   } catch (error) {
//     console.error('Error Details:', error);
//     res.status(500).json(createResponse('error', 'Error verifying OTP'));
//   }
// };

export const verifySignupOtp = async (req, res) => {
  const { email, otp, fullName, phoneNumber, password } = req.body;

  try {
    const isOtpValid = await verifyOtp(email, otp, 'signup');  // Using email as the identifier for OTP

    if (!isOtpValid) {
      return res.status(400).json(createResponse('error', 'Invalid or expired OTP'));
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phoneNumber }]
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? "Email" : "Phone number";
      return res.status(409).json(createResponse('error', `${field} already exists.`));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      phoneNumber,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    await newUser.save();

    // Generate a JWT token
    const token = jwt.sign({ id: newUser._id }, jwtSecret, { expiresIn: '1h' });


    // Set the token as an HTTP-only cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure:  false,   //process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'Strict',
      maxAge: 3600000 // 1 hour
    });

    res.status(201).json(createResponse('success', 'User created successfully and signed in', { token }));
  } catch (error) {
    console.error('Error Details:', error);
    res.status(500).json(createResponse('error', 'Error verifying OTP'));
  }
};

export const verifyTopUpOtp = async (req, res) => {
  try {
    const validationResult = verifyOtpSchema.safeParse(req.body);
    const { success, error: parseErrors, data } = validationResult;

    if (!success) {
      const errors = parseErrors.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      return res.status(400).json({ errors });
    }

    const { otp } = data;
    const fromUserId = req.user.userId; // Assuming the user ID is stored in req.user.id

    const isOtpValid = await verifyOtp(fromUserId, otp, 'topUp');
    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Retrieve top-up details (this should be stored temporarily)
    const { amount, source, sourceDetails } = req.session.topUpDetails;

    const user = await User.findById(fromUserId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's balance
    user.balance += amount;
    await user.save();

    // Create a new transaction record
    const newTransaction = new Transaction({
      type: 'topUp',
      amount,
      fromUserId,
      status: 'completed',
      source,
      sourceDetails
    });
    await newTransaction.save();

    // Clear the session top-up details
    req.session.topUpDetails = null;

    res.status(201).json(newTransaction);
  } catch (error) {
    console.error("Error in verifyTopUpOtp:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation failed", errors: error.errors });
    }
    res.status(500).json({ message: "Error processing transaction", error: error.message });
  }
};

// export const verifyWithdrawOtp = async (req, res) => {
//   try {
//     const validationResult = verifyOtpSchema.safeParse(req.body);
//     const { success, error: parseErrors, data } = validationResult;

//     if (!success) {
//       const errors = parseErrors.issues.map(issue => ({
//         field: issue.path.join('.'),
//         message: issue.message
//       }));
//       return res.status(400).json({ errors });
//     }

//     const { otp } = data;
//     const fromUserId = req.user.userId; // Assuming the user ID is stored in req.user.userId

//     const user = await User.findById(fromUserId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const isOtpValid = await verifyOtp(user.email, otp, 'withdraw');
//     if (!isOtpValid) {
//       return res.status(400).json({ message: "Invalid or expired OTP" });
//     }

//     const withdrawDetails = req.session.withdrawDetails;
//     if (!withdrawDetails) {
//       return res.status(400).json({ message: "Withdrawal details not found in session" });
//     }
//     const { amount, destination, destinationDetails } = withdrawDetails;

//     if (amount > user.balance) {
//       return res.status(400).json({ message: "Insufficient balance" });
//     }

//     user.balance -= amount;
//     await user.save();

//     const newTransaction = new Transaction({
//       type: 'withdrawal',
//       amount,
//       fromUserId: fromUserId,
//       status: 'completed',
//       destination,
//       destinationDetails
//     });
//     await newTransaction.save();

//     req.session.withdrawDetails = null;

//     res.status(201).json(newTransaction);
//   } catch (error) {
//     console.error("Error in verifyWithdrawOtp:", error);
//     if (error instanceof z.ZodError) {
//       return res.status(400).json({ message: "Validation failed", errors: error.errors });
//     }
//     res.status(500).json({ message: "Error processing transaction", error: error.message });
//   }
// };

export const verifyWithdrawOtp = async (req, res) => {
  try {
    const validationResult = verifyOtpSchema.safeParse(req.body);
    const { success, error: parseErrors, data } = validationResult;

    if (!success) {
      const errors = parseErrors.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      return res.status(400).json({ errors });
    }

    const { otp } = data;
    const fromUserId = req.user.userId;

    const user = await User.findById(fromUserId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isOtpValid = await verifyOtp(user.email, otp, 'withdraw');
    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const withdrawDetails = req.session.withdrawDetails;
    if (!withdrawDetails) {
      return res.status(400).json({ message: "Withdrawal details not found in session" });
    }
    const { amount, destination, destinationDetails } = withdrawDetails;

    if (amount > user.balance) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    user.balance -= amount;
    await user.save();

    const newTransaction = new Transaction({
      type: 'withdrawal',
      amount,
      fromUserId: fromUserId,
      status: 'completed',
      destination,
      destinationDetails
    });
    await newTransaction.save();

    req.session.withdrawDetails = null;

    res.status(201).json(newTransaction);
  } catch (error) {
    console.error("Error in verifyWithdrawOtp:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation failed", errors: error.errors });
    }
    res.status(500).json({ message: "Error processing transaction", error: error.message });
  }
};