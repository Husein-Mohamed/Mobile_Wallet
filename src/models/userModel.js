// src/models/User.js

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    pin: { type: String, required: false }, // Add the pin field here
    password: { type: String, required: true },
    balance: { type: Number, default: 0 }, // default balance set to 0
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
