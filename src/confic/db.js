
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const DBURL = process.env.DB_URI;

const connectDB = async () => {
  console.log('Attempting to connect to MongoDB...');
  try {
    const conn = await mongoose.connect(DBURL);
    console.log(`MongoDB Connected✅: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
