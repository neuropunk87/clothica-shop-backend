import 'dotenv/config';
import mongoose from 'mongoose';
import { connectMongoDB } from '../db/connectMongoDB.js';
import { User } from '../models/user.js';
import { hashPassword } from '../services/auth.js';

const phone = process.env.ADMIN_PHONE;
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim();

const validateInput = () => {
  const errors = [];

  if (!phone || !/^\+380\d{9}$/.test(phone)) {
    errors.push('ADMIN_PHONE must use +380XXXXXXXXX format');
  }

  if (!password || password.length < 10 || password.length > 128) {
    errors.push('ADMIN_PASSWORD must be 10-128 characters long');
  }

  if (name && (name.length < 3 || name.length > 32)) {
    errors.push('ADMIN_NAME must be 3-32 characters long');
  }

  if (errors.length > 0) {
    throw new Error(`Invalid admin input:\n- ${errors.join('\n- ')}`);
  }
};

const createAdmin = async () => {
  validateInput();
  await connectMongoDB();

  const passwordHash = await hashPassword(password);
  const update = {
    $set: {
      password: passwordHash,
      role: 'admin',
    },
    $setOnInsert: {
      phone,
      name: name || 'Admin',
    },
  };

  if (name) {
    update.$set.name = name;
  }

  const user = await User.findOneAndUpdate(
    { phone },
    update,
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );

  console.log(`Admin user is ready: ${user.phone}`);
};

createAdmin()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
