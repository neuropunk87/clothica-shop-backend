import { DefaultAuthProvider } from 'adminjs';

import { User } from '../../../src/models/user.js';
import { verifyPassword } from '../../../src/services/auth.js';

import componentLoader from './component-loader.js';

const provider = new DefaultAuthProvider({
  componentLoader,
  authenticate: async ({ email, password }) => {
    try {
      const phone = email?.trim();
      if (!phone || !password) return null;

      const user = await User.findOne({ phone });

      if (!user) {
        return null;
      }
      if (!user.password) {
        return null;
      }
      const isValidPassword = await verifyPassword(password, user.password);

      if (isValidPassword && user.role === 'admin') {
        return {
          phone: user.phone,
          name: user.name,
          email: user.email,
          role: user.role,
          _id: user._id,
        };
      }
      return null;
    } catch (error) {
      console.error('Admin authentication failed:', error);
      return null;
    }
  },
});

export default provider;
