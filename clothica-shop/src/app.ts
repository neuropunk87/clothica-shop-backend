import express from 'express';
import helmet from 'helmet';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import AdminJS from 'adminjs';
import { buildAuthenticatedRouter } from '@adminjs/express';
import MongoStore from 'connect-mongo';

import {
  cookieSameSite,
  cookieSecure,
  isProd,
  validateSecurityEnv,
} from '../../src/config/security.js';

import provider from './admin/auth-provider.js';
import options from './admin/options.js';
import initializeDb from './db/index.js';

const port = process.env.PORT || 3030;

const start = async () => {
  validateSecurityEnv();

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', isProd ? 1 : false);

  app.use(
    helmet({
      contentSecurityPolicy: isProd
        ? {
          useDefaults: true,
          directives: {
            'default-src': ['\'self\''],
            'base-uri': ['\'self\''],
            'font-src': ['\'self\'', 'https:', 'data:'],
            'frame-ancestors': ['\'none\''],
            'img-src': ['\'self\'', 'https:', 'data:', 'blob:'],
            'object-src': ['\'none\''],
            'script-src': ['\'self\'', '\'unsafe-inline\''],
            'style-src': ['\'self\'', '\'unsafe-inline\''],
            'upgrade-insecure-requests': [],
          },
        }
        : false,
      crossOriginEmbedderPolicy: false,
      hsts: isProd
        ? {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        }
        : false,
      referrerPolicy: {
        policy: 'no-referrer',
      },
    }),
  );

  await initializeDb();

  const admin = new AdminJS(options);
  const adminLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => ipKeyGenerator(req.ip),
  });
  const sessionStore = MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    collectionName: 'admin_sessions',
    ttl: 24 * 60 * 60,
  });

  if (process.env.NODE_ENV === 'production') {
    await admin.initialize();
  } else {
    admin.watch();
  }
  const router = buildAuthenticatedRouter(
    admin,
    {
      cookiePassword: process.env.ADMIN_COOKIE_SECRET,
      cookieName: 'adminjs',
      provider,
    },
    null,
    {
      secret: process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_COOKIE_SECRET,
      store: sessionStore,
      saveUninitialized: false,
      resave: false,
      name: 'adminjs',
      cookie: {
        httpOnly: true,
        secure: cookieSecure,
        sameSite: cookieSameSite,
        maxAge: 1000 * 60 * 60 * 24,
      },
    },
  );

  app.post(`${admin.options.rootPath}/login`, adminLoginLimiter);
  app.use(admin.options.rootPath, router);

  app.listen(port, () => {
    const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;
    console.log(`AdminJS available at ${baseUrl}${admin.options.rootPath}`);
  });
};

start();
