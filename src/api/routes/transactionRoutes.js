// src/routes/transactionRoutes.js
import { Router } from 'express';
import { topUp, withdraw, transfer, verifyPin } from '../controllers/transactionController.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { topUpSchema, withdrawSchema, transferSchema, pinSchema } from '../validations/transactionValidation.js';
import authenticateToken from '../middlewares/authenticateToken.js';

const router = Router();

router.post('/top-up', authenticateToken, validateRequest(topUpSchema), topUp);
router.post('/withdraw', authenticateToken, validateRequest(withdrawSchema), withdraw);
router.post('/transfer', authenticateToken, validateRequest(transferSchema), transfer);

router.post('/verify-pin', authenticateToken, validateRequest(pinSchema), verifyPin);

export default router;
