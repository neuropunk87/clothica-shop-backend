import { DefaultAuthProvider } from 'adminjs';
import componentLoader from './component-loader.js';
import bcrypt from 'bcrypt';
import { User } from '../models/user.js';

const provider = new DefaultAuthProvider({
  componentLoader,
  authenticate: async ({ email, password }) => {
    try {
      const phone = email;

      console.log(`Admin login attempt for phone: ${phone}`);
      const user = await User.findOne({ phone });

      if (!user) {
        console.log('Admin login failed: User not found');
        return null;
      }
      if (!user.password) {
        console.log('Admin login failed: User has no password set');
        return null;
      }
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (isValidPassword && user.role === 'admin') {
        console.log(`Admin login successful for user: ${user.email}`);
        return user;
      }
      console.log('Admin login failed: Invalid credentials or not an admin');
      return null;
    } catch (error) {
      console.error('CRITICAL ERROR during admin authentication:', error);
      return null;
    }
  },
});

export default provider;
