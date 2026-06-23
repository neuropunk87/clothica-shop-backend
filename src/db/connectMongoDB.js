import mongoose from 'mongoose';
import { isProd } from '../config/security.js';

mongoose.set('strictQuery', true);
mongoose.set('sanitizeFilter', true);

export const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL, {
      autoIndex: !isProd,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
