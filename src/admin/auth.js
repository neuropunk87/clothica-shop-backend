// src/admin/auth.js

import { User } from '../models/user.js';
import bcrypt from 'bcrypt';

export const authenticate = async (phone, password) => {
  try {
    // Search for a user by phone number (your phone number is a unique identifier)
    const user = await User.findOne({ phone });

    if (!user) {
      console.log('User not found');
      return null;
    }

    // Checking if the user is an administrator
    if (user.role !== 'admin') {
      console.log('User is not admin');
      return null;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log('Password mismatch');
      return null;
    }

    console.log('Admin authenticated:', user.phone);

    return {
      phone: user.phone,
      name: user.name,
      email: user.email,
      role: user.role,
      _id: user._id,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
};