
import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    required: true,
  },
  expiresIn: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

export default mongoose.model('Otp', otpSchema);

  