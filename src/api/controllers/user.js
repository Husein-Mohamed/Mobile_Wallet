import { ZodError } from 'zod';
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { generateJwtToken } from '../../utils/generateJwtToken.js'; // Import JWT service
import { generateOtp,  storeOtp,  verifyOtp } from '../../utils/generateOtp.js'; // Import OTP service

import { User } from "../../models/userModel.js";
import { setupPinSchema, signupValidationSchema, updateProfileValidationSchema } from '../validations/userValidationSchema.js';
// import { sendSms } from '../utils/smsService.js'; // Adjust the path as needed
// import storeOtp from '../../utils/storeOtp.js'; // 
import sendEmail from '../../utils/emailService.js';

import sendOtpToWhatsapp from '../../utils/sendOtpToWhatsapp.js';
import { jwtSecret } from '../../confic/confic.js';




// Controller to get all user profiles
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password'); // Omit the password field
    res.json(users);
  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({ message: 'Error retrieving users' });
  }
};

// export const signup = async (req, res) => {
//   console.log(req.body);
//   try {
//     // Validate the request body against the schema
//     const validationResult = signupValidationSchema.safeParse(req.body);
//     const { success, error: parseErrors, data } = validationResult;

//     // Check if validation failed
//     if (!success) {
//       const errors = parseErrors.issues.map(issue => ({
//         field: issue.path.join('.'),
//         message: issue.message
//       }));
//       return res.status(400).send({ errors });
//     }

//     // Check if user with the same email or phoneNumber already exists
//     const existingUser = await User.findOne({
//       $or: [{ email: data.email.toLowerCase() }, { phoneNumber: data.phoneNumber }]
//     });

//     if (existingUser) {
//       const field = existingUser.email === data.email.toLowerCase() ? "Email" : "Phone number";
//       return res.status(409).send({ message: `${field} already exists.` });
//     }

//     // Hash the password and pin from the validated data
//     const hashedPassword = await bcrypt.hash(data.password, 10);
//     // const hashedPin = await bcrypt.hash(data.pin, 10);

//     // Create a new user with the validated data
//     const newUser = new User({
//       fullName: data.fullName,
//       phoneNumber: data.phoneNumber,
//       email: data.email.toLowerCase(), // Assuming email needs to be stored in lowercase
//       password: hashedPassword,
//       // pin: hashedPin, // Add the hashed pin here
//     });

//     // Save the new user to the database
//     await newUser.save();

//     // Send success response
//     res.status(201).send({ message: 'User created successfully' });
//   } catch (error) {
//     console.error('Error Details:', error);
//     res.status(500).send('Error creating the user');
//   }
// };

// export const signup = async (req, res) => {
//   console.log(req.body);
//   try {
//     const validationResult = signupValidationSchema.safeParse(req.body);
//     const { success, error: parseErrors, data } = validationResult;

//     if (!success) {
//       const errors = parseErrors.issues.map(issue => ({
//         field: issue.path.join('.'),
//         message: issue.message
//       }));
//       return res.status(400).send({ errors });
//     }

//     const existingUser = await User.findOne({
//       $or: [{ email: data.email.toLowerCase() }, { phoneNumber: data.phoneNumber }]
//     });

//     if (existingUser) {
//       const field = existingUser.email === data.email.toLowerCase() ? "Email" : "Phone number";
//       return res.status(409).send({ message: `${field} already exists.` });
//     }

//     const otp = generateOtp();
//     await storeOtp(data.email.toLowerCase(), otp, 'signup');

//     if (data.email) {
//       await sendEmail({
//         to: data.email.toLowerCase(),
//         subject: 'Your Signup OTP',
//         text: `Your OTP is: ${otp}. It expires in 10 minutes.`
//       });
//     } else if (data.phoneNumber) {
//       await sendOtpToWhatsapp(data.phoneNumber, otp);
//     } else {
//       return res.status(400).send("Cannot send OTP, contact information missing.");
//     }

//     res.status(200).send({ message: "OTP sent. Please verify to complete sign-up." });
//   } catch (error) {
//     console.error('Error Details:', error);
//     res.status(500).send('Error during the sign-up process');
//   }
// };

// Controller to get the current user's profile
export const GetUserByID = async (req, res) => {
  try {
    // Assuming your authentication middleware securely adds the user ID to req.user
    const userId = req.params.id;
    const user = await User.findById(userId).select('-password'); // Excludes the password from the result

    if (!user) {
      // Correct use of status code for resource not found
      return res.status(404).json({ message: 'User not found' });
    }

    // Successfully send the user information back to the client, excluding the password
    res.json(user);
  } catch (error) {
    // Log the error internally
    console.error('Get User Profile Error:', error);

    // Respond with a generic error message to avoid leaking any sensitive details
    res.status(500).json({ message: 'Error retrieving user profile, please try again later.' });
  }
};

export const signup = async (req, res) => {
  console.log(req.body);
  try {
    const validationResult = signupValidationSchema.safeParse(req.body);
    const { success, error: parseErrors, data } = validationResult;

    if (!success) {
      const errors = parseErrors.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      return res.status(400).send({ errors });
    
    }
 
    const existingUser = await User.findOne({
      $or: [{ email: data.email.toLowerCase() }, { phoneNumber: data.phoneNumber }]
    });

    if (existingUser) {
      const field = existingUser.email === data.email.toLowerCase() ? "Email" : "Phone number";
      return res.status(409).send({ message: `${field} already exists.` });
    }

    const otp = generateOtp();
    await storeOtp(data.email, otp, 'signup');  // Using email as the identifier for OTP

    const emailOptions = {
      to: data.email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}`,
    };

    await sendEmail(emailOptions);

    res.status(200).send({ message: 'OTP sent to your email. Please verify to complete the registration.' });
  } catch (error) {
    console.error('Error Details:', error);
    res.status(500).send('Error processing signup');
  }
};

// Signin controller


export const signin = async (req, res) => {
  const { identifier, password } = req.body; // 'identifier' can be either email or phone number

  try {
    // Determine if identifier is email or phone based on its format
    const isEmail = identifier.includes('@');
    const queryField = isEmail ? { email: identifier.toLowerCase() } : { phoneNumber: identifier };
    const user = await User.findOne(queryField);
    
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send("Invalid credentials");
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });

    // Set the token as a cookie in the response with security options
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Ensure cookie is only sent over HTTPS in production
      sameSite: 'Strict', // Helps prevent CSRF attacks
      maxAge: 3600000 // 1 hour
    });

    // Remove sensitive fields like passwords from the user object
    const { password: _, ...userWithoutPassword } = user.toObject(); // This creates a copy excluding the password field

    // Respond with user data without sensitive info
    return res.status(200).send({
      message: "Sign-in successful.",
      user: userWithoutPassword // Send user data without sensitive info
    });
  } catch (error) {
    console.error("Signin Error:", error);
    res.status(500).send("Error during the sign-in process");
  }
};

export const setupPin = async (req, res) => {
  try {
    // Validate the request body against the schema
    const validationResult = setupPinSchema.safeParse(req.body);
    const { success, error: parseErrors, data } = validationResult;

    // Check if validation failed
    if (!success) {
      const errors = parseErrors.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      return res.status(400).send({ errors });
    }

    const { pin } = data; // Extract the pin from the validated data
    const userId = req.user.userId; // Get the authenticated user's ID from req.user

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Hash the pin before storing it in the database
    const hashedPin = await bcrypt.hash(pin, 10);
    user.pin = hashedPin; // Update the user's pin

    // Save the updated user
    await user.save();

    // Respond with a success message
    res.status(200).send({ message: 'PIN setup successfully' });
  } catch (error) {
    console.error('Error Details:', error);
    res.status(500).send('Error setting up PIN');
  }
};


export const updateUserProfile = async (req, res) => {
  const { userId } = req.user;
  console.log('req.user:', req.user);
  console.log('User ID from JWT:', userId);

  const { fullName, email } = req.body;

  try {
    const result = updateProfileValidationSchema.safeParse({ fullName, email });
    if (!result.success) {
      return res.status(400).json({ message: result.error.issues[0].message });
    }

    // Manual verification
    const user = await User.findById(userId);
    console.log('User found:', user);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.fullName = fullName;
    user.email = email;
    const updatedUser = await user.save();

    console.log('Updated User:', updatedUser);

    res.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Error updating user profile', error: error.message });
  }
};
// Controller for deleting user account
export const deleteUser = async (req, res) => {
  const { userId } = req.user; // Extracted from JWT after authentication

  try {
    const deletedUser = await User.findByIdAndDelete(userId);

    if (deletedUser) {
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ message: 'Error deleting user account' });
  }
};

