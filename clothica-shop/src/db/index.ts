import mongoose from 'mongoose';
import { Database, Resource } from '@adminjs/mongoose';
import AdminJS from 'adminjs';

import { isProd } from '../../../src/config/security.js';

AdminJS.registerAdapter({ Database, Resource });
mongoose.set('strictQuery', true);
mongoose.set('sanitizeFilter', true);

const initialize = async () => {
  const db = await mongoose.connect(process.env.MONGO_URL as string, {
    autoIndex: !isProd,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
  });

  return { db };
};

export default initialize;
