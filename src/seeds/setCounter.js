import 'dotenv/config';
import mongoose from 'mongoose';
import { Counter } from '../models/counter.js';

await mongoose.connect(process.env.MONGO_URL);

await Counter.updateOne(
  { _id: 'orderNum' },
  { $set: { seq: 1035959 } },
  { upsert: true }
);

console.log('✅ Counter updated. Next order will be 1035960');
process.exit();
