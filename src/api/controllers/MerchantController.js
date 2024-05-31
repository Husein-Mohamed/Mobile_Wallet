// import Merchant from '../models/Merchant';
import Merchant from '../../models/MerchantModel.js';
// import { merchantValidationSchema } from '../validations/transactionValidation.js';

// Create Merchant
export const createMerchant = async (req, res) => {
    try {
        const { businessName, contactEmail, address } = req.body;
        const newMerchant = new Merchant({
            businessName,
            contactEmail,
            address
        });

        const savedMerchant = await newMerchant.save();
        res.status(201).json(savedMerchant);
    } catch (error) {
        console.error('Error creating the merchant:', error);
        res.status(500).json({ message: 'Failed to create merchant', error: error.message });
    }
};


// Get Merchant
export const getMerchant = async (req, res) => {
    try {
        const merchant = await Merchant.findOne({ merchantId: req.params.merchantId });
        if (!merchant) {
            return res.status(404).json({ message: "Merchant not found" });
        }
        res.status(200).json(merchant);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving merchant", error: error.message });
    }
};

// Update Merchant
export const updateMerchant = async (req, res) => {
    const { merchantId } = req.params;
    const result = merchantValidationSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ errors: result.error.flatten() });
    }

    try {
        const updatedMerchant = await Merchant.findOneAndUpdate(
            { merchantId },
            { $set: result.data },
            { new: true }
        );
        if (!updatedMerchant) {
            return res.status(404).json({ message: "Merchant not found" });
        }
        res.status(200).json(updatedMerchant);
    } catch (error) {
        res.status(500).json({ message: "Error updating merchant", error: error.message });
    }
};

// Delete Merchant
export const deleteMerchant = async (req, res) => {
    const { merchantId } = req.params;
    try {
        const deletedMerchant = await Merchant.findOneAndDelete({ merchantId });
        if (!deletedMerchant) {
            return res.status(404).json({ message: "Merchant not found" });
        }
        res.status(200).json({ message: "Merchant successfully deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting merchant", error: error.message });
    }
};
