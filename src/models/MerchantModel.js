
import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';

const merchantSchema = new mongoose.Schema({
    merchantId: { type: String, required: true, unique: true, default: uuidv4 },
    businessName: { type: String, required: true },
    contactEmail: { type: String, required: true },
    address: { type: String, required: true },
    // Additional fields as necessary
},

{ timestamps: true });

const Merchant = mongoose.model("Merchant", merchantSchema);
export default Merchant;
