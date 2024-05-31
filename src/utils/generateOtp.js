// import bcrypt from 'bcrypt';
// import Otp from '../models/otpSchema.js';

// // Function to generate a random 4-digit OTP
// const generateOtp = () => {
//   return Math.floor(1000 + Math.random() * 9000);
// };

// // Function to store a generated OTP in the database with hashing
// const storeOtp = async (userId, otp, purpose) => {
//   try {
//     // Convert to string for hashing
//     const otpString = otp.toString();
//     const otpHash = await bcrypt.hash(otpString, 10);
//     console.log(`Generated OTP (Plaintext): ${otpString}`);
//     console.log(`Generated OTP (Hashed): ${otpHash}`);

//     // Set the new OTP expiration time
//     const expiresIn = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

//     // Delete any non-expired OTPs for this user and purpose
//     await Otp.deleteMany({ userId, purpose });

//     // Store the new OTP
//     await Otp.create({ userId, otp: otpHash, purpose, expiresIn });
//     console.log('New OTP stored successfully.');
//   } catch (error) {
//     console.error('Error storing OTP:', error);
//   }
// };

// // Function to verify the OTP against the stored value
// const verifyOtp = async (userId, otp, purpose) => {
//   try {
//     // Find the OTP record in the database based on userId and purpose
//     const otpRecord = await Otp.findOne({ userId, purpose });

//     // Debugging log to confirm if an OTP was found
//     if (!otpRecord) {
//       console.log('OTP record not found or incorrect purpose.');
//       return false;
//     }

//     console.log('OTP Record:', otpRecord);

//     // Check if the OTP has expired
//     if (otpRecord.expiresIn < new Date()) {
//       // OTP has expired; delete it from the database
//       const deletedOtp = await Otp.findByIdAndDelete(otpRecord._id);
//       console.log('Expired OTP deleted:', deletedOtp);
//       return false;
//     }

//     // Verify the given OTP against the hashed value
//     const isMatch = await bcrypt.compare(otp.toString(), otpRecord.otp);
//     console.log('OTP Comparison Result:', isMatch);

//     return isMatch;
//   } catch (error) {
//     // Log the actual error for debugging purposes
//     console.error('Error verifying OTP:', error);

//     // Provide a user-friendly error message
//     throw new Error('An error occurred while verifying the OTP. Please try again later.');
//   }
// };

// // Export the functions for use in other modules
// export { generateOtp, storeOtp, verifyOtp };



import bcrypt from 'bcrypt';
import Otp from '../models/otpSchema.js';

// Function to generate a random 4-digit OTP
const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

// Function to store a generated OTP in the database with hashing
const storeOtp = async (email, otp, purpose) => {
  try {
    const otpString = otp.toString();
    const otpHash = await bcrypt.hash(otpString, 10);
    console.log(`Generated OTP (Plaintext): ${otpString}`);
    console.log(`Generated OTP (Hashed): ${otpHash}`);

    const expiresIn = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

    // Delete any non-expired OTPs for this email and purpose
    await Otp.deleteMany({ email, purpose });

    // Store the new OTP
    await Otp.create({ email, otp: otpHash, purpose, expiresIn });
    console.log('New OTP stored successfully.');
  } catch (error) {
    console.error('Error storing OTP:', error);
  }
};

// Function to verify the OTP against the stored value
const verifyOtp = async (email, otp, purpose) => {
  try {
    const otpRecord = await Otp.findOne({ email, purpose });

    if (!otpRecord) {
      console.log('OTP record not found or incorrect purpose.');
      return false;
    }

    console.log('OTP Record:', otpRecord);

    if (otpRecord.expiresIn < new Date()) {
      const deletedOtp = await Otp.findByIdAndDelete(otpRecord._id);
      console.log('Expired OTP deleted:', deletedOtp);
      return false;
    }

    const isMatch = await bcrypt.compare(otp.toString(), otpRecord.otp);
    console.log('OTP Comparison Result:', isMatch);

    return isMatch;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw new Error('An error occurred while verifying the OTP. Please try again later.');
  }
};

export { generateOtp, storeOtp, verifyOtp };
