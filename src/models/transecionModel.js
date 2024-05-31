// src/models/Transaction.js

import mongoose from "mongoose";

const { Schema, model } = mongoose;

const transactionSchema = new Schema({
  
  type: { type: String, enum: ["topUp", "withdrawal", "transfer"], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true, default: "USD" },
  fromUserId: { type: Schema.Types.ObjectId, ref: "User" },
  toUserId: { type: Schema.Types.ObjectId, ref: "User", },
  description: { type: String, required: false },  // Optional description field
  status: { type: String, enum: ["pending", "completed", "cancelled", "failed"], default: "pending" },
  source: { type: String, enum: ["card", "account"], required:false},
  sourceDetails: {
    bankName: String,
    accountNumber: String,
  },
  destinationType: { type: String, enum: ["wallet", "merchant"], required: function() { return this.type === 'transfer'; } },
  destinationIdentifier: String,
}, { timestamps: true });

export const Transaction = model("Transaction", transactionSchema);

// export default Transaction;

