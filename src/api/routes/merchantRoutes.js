// src/routes/merchantRoutes.js

import express from 'express';
import { createMerchant, deleteMerchant, getMerchant, updateMerchant } from '../controllers/MerchantController.js';

const router = express.Router();

// Create a new merchant
router.post('/createMerchant', createMerchant);


// Retrieve a specific merchant by merchantId
router.get('/merchants/:merchantId', getMerchant);

// Update a specific merchant by merchantId
router.put('/merchants/:merchantId', updateMerchant);

// Delete a specific merchant by merchantId
router.delete('/merchants/:merchantId', deleteMerchant);

export default router;
