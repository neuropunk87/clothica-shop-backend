import AdminJS from 'adminjs';
import { buildAuthenticatedRouter } from '@adminjs/express';
import { Database, Resource } from '@adminjs/mongoose';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import MongoStore from 'connect-mongo';
import { User } from '../models/user.js';
import { Good } from '../models/good.js';
import { Category } from '../models/category.js';
import { Order } from '../models/order.js';
import { Feedback } from '../models/feedback.js';
import { Subscription } from '../models/subscription.js';
import { Session } from '../models/session.js';

AdminJS.registerAdapter({ Database, Resource });

const adminOptions = {
  resources: [
    {
      resource: User,
      options: { navigation: { name: 'Management', icon: 'User' } },
    },
    {
      resource: Good,
      options: { navigation: { name: 'Catalog', icon: 'Box' } },
    },
    {
      resource: Category,
      options: { navigation: { name: 'Catalog', icon: 'List' } },
    },
    {
      resource: Order,
      options: { navigation: { name: 'Sales', icon: 'ShoppingCart' } },
    },
    {
      resource: Feedback,
      options: { navigation: { name: 'Management', icon: 'Chat' } },
    },
    {
      resource: Subscription,
      options: { navigation: { name: 'Management', icon: 'Mail' } },
    },
    {
      resource: Session,
      options: { navigation: { name: 'System', icon: 'Activity' } },
    },
  ],

  locale: {
    language: 'en',
    translations: {
      messages: {
        loginWelcome: 'Clothica Admin Panel',
        loginWelcomeMessage:
          'Please enter your phone number and password to log in.',
        loginButton: 'Login',
      },
      properties: {
        email: 'Phone Number',
        password: 'Password',
      },
      labels: {
        User: 'Users',
        Good: 'Goods',
        Category: 'Categories',
        Order: 'Orders',
        Feedback: 'Feedback',
        Subscription: 'Subscriptions',
        Session: 'Active Sessions',
      },
    },
  },

  rootPath: '/admin',

  branding: {
    companyName: 'Clothica Shop',
    softwareBrothers: false,
    logo: '/logo.png',
    favicon: '/favicon.png',
  },
};

export const admin = new AdminJS(adminOptions);

export const adminRouter = buildAuthenticatedRouter(
  admin,
  {
    authenticate: async (phone, password) => {
      const user = await User.findOne({ phone });
      if (user && user.password) {
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (isValidPassword && user.role === 'admin') {
          return user;
        }
      }
      return false;
    },
    cookieName: process.env.ADMIN_COOKIE_NAME || 'adminjs',
    cookiePassword: process.env.ADMIN_COOKIE_PASSWORD,
  },
  null,
  {
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      collectionName: 'sessions',
    }),
    secret: process.env.ADMIN_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: process.env.NODE_ENV === 'production',
      secure: process.env.NODE_ENV === 'production',
    },
  },
);
