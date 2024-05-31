import express, { Router } from "express";
import userRouter from "./api/routes/user.js";
import connectDB from "./confic/db.js";
import cookieParser from "cookie-parser";
import passwordRoutes from "./api/routes/passwordRoutes.js";
import errorHandler from "./api/middlewares/errorHandler.js";
import morgan from "morgan";
import cors from 'cors';
import rateLimit from "express-rate-limit";
import helmet from "helmet";
// import balanceRoutes from "./api/routes/balanceRoutes.js";
import transactionRoutes from './api/routes/transactionRoutes.js';
import merchantRoutes from './api/routes/merchantRoutes.js'; 
import otpRoutes from './api/routes/otpRoutes.js';
import crypto from 'crypto';
import session from 'express-session';
const app = express();

const secret = crypto.randomBytes(64).toString('hex');

app.use(session({
  secret: secret,  // Use the generated secret
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // Set to true if using HTTPS
}));

app.use(helmet());
app.use(morgan("dev"));
app.use(cors());

// Apply rate limiting to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests, please try again later.'
});


// Apply to all requests
app.use(limiter);

app.use(cookieParser());
app.use(express.json());
connectDB();
const port = 3000;

// Mount userRouter with the specific base path
app.use("/api/v1/users", userRouter);
// app.use('/api/v1/auth', authRoutes);
app.use("/api/v1/password", passwordRoutes);

// app.use('/api/v1/users', balanceRoutes);
app.use('/api/v1/otp', otpRoutes);


app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/merchants', merchantRoutes);


// Use the error handling middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`App is listening at http://localhost:${port}`);
});
