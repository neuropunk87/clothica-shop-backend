import { User } from '../models/user.js';
import { verifyPassword } from '../services/auth.js';

export const authenticate = async (phone, password) => {
  try {
    const normalizedPhone = phone?.trim();
    if (!normalizedPhone || !password) {
      return null;
    }

    const user = await User.findOne({ phone: normalizedPhone });

    if (!user) {
      return null;
    }
    if (user.role !== 'admin') {
      return null;
    }
    const isMatch = await verifyPassword(password, user.password);

    if (!isMatch) {
      return null;
    }

    return {
      phone: user.phone,
      name: user.name,
      email: user.email || user.phone,
      role: user.role,
      _id: user._id.toString(),
    };
  } catch (error) {
    console.error('Admin authentication failed:', error);
    return null;
  }
};
