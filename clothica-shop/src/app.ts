import express from 'express';
import AdminJS from 'adminjs';
import { buildAuthenticatedRouter } from '@adminjs/express';
import provider from './admin/auth-provider.js';
import options from './admin/options.js';
import initializeDb from './db/index.js';

const port = process.env.PORT || 3030;

const start = async () => {
  const app = express();

  await initializeDb();

  const admin = new AdminJS(options);

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
      secret: process.env.ADMIN_COOKIE_SECRET,
      saveUninitialized: true,
      resave: true,
    },
  );

  app.use(admin.options.rootPath, router);

  app.listen(port, () => {
    const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;
    console.log(`AdminJS available at ${baseUrl}${admin.options.rootPath}`);
  });
};

start();
