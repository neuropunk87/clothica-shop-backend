import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import { errors } from 'celebrate';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../config/swagger.js';
import MongoStore from 'connect-mongo';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import {
  setupTelegramWebhook,
  processTelegramUpdate,
} from './services/telegram.js';
import { adminOptions } from './admin/admin.config.js';
import { authenticate } from './admin/auth.js';
import {
  allowedOrigins,
  cookieSameSite,
  cookieSecure,
  isAllowedOrigin,
  isProd,
  requestBodyLimits,
  validateSecurityEnv,
} from './config/security.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import goodRoutes from './routes/goodRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import i18next from './config/i18n.js';
import i18nextMiddleware from 'i18next-http-middleware';
import { apiLimiter, adminLoginLimiter } from './middleware/rateLimitApi.js';
import { searchRateLimiter } from './middleware/rateLimitSearch.js';
import { verifyRequestOrigin } from './middleware/verifyRequestOrigin.js';
import { verifyTelegramWebhook } from './middleware/verifyTelegramWebhook.js';

validateSecurityEnv();

const app = express();
const PORT = process.env.PORT ?? 3030;
const isSwaggerEnabled = !isProd || process.env.ENABLE_SWAGGER === 'true';

app.disable('x-powered-by');
app.set('trust proxy', isProd ? 1 : false);

const createAdminJS = () => {
  const admin = new AdminJS(adminOptions);

  const sessionStore = MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    collectionName: 'admin_sessions',
    ttl: 24 * 60 * 60,
  });
  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
      authenticate,
      cookieName: 'adminjs',
      cookiePassword: process.env.ADMIN_COOKIE_SECRET,
    },
    null,
    {
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      secret: process.env.ADMIN_SESSION_SECRET,
      cookie: {
        httpOnly: true,
        secure: cookieSecure,
        sameSite: cookieSameSite,
        priority: 'high',
        maxAge: 1000 * 60 * 60 * 24,
      },
      name: 'adminjs',
    },
  );
  app.post(`${admin.options.rootPath}/login`, adminLoginLimiter);
  app.use(admin.options.rootPath, verifyRequestOrigin, adminRouter);

  if (!isProd) {
    admin.watch();
  }
  console.log('✅ AdminJS mounted at:', admin.options.rootPath);
};

app.use(logger);

app.use(
  helmet({
    contentSecurityPolicy: isProd
      ? {
          useDefaults: true,
          directives: {
            'default-src': ["'self'"],
            'base-uri': ["'self'"],
            'connect-src': ["'self'", ...allowedOrigins],
            'font-src': ["'self'", 'https:', 'data:'],
            'frame-ancestors': ["'none'"],
            'img-src': ["'self'", 'https:', 'data:', 'blob:'],
            'object-src': ["'none'"],
            'script-src': ["'self'", "'unsafe-inline'"],
            'style-src': ["'self'", "'unsafe-inline'"],
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

app.use(
  cors({
    origin: (origin, callback) => {
      if (!isProd) return callback(null, true);
      if (!origin) return callback(null, true);
      if (isAllowedOrigin(origin)) return callback(null, true);

      const error = new Error('Not allowed by CORS');
      error.statusCode = 403;
      return callback(error);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
    maxAge: 600,
  }),
);

app.use(cookieParser());

app.use(
  express.static('public', {
    dotfiles: 'deny',
    index: false,
    maxAge: isProd ? '1d' : 0,
  }),
);

// AdminJS uses its own multipart/form parser for login and actions, so it must
// be mounted before the API json/urlencoded body parsers.
createAdminJS();

app.use(express.json({ limit: requestBodyLimits.json, strict: true }));
app.use(
  express.urlencoded({
    extended: true,
    limit: requestBodyLimits.urlencoded,
    parameterLimit: requestBodyLimits.urlencodedParameterLimit,
  }),
);

app.use(i18nextMiddleware.handle(i18next));

app.use('/api', apiLimiter);
app.use(verifyRequestOrigin);

app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);
app.use('/api', searchRateLimiter, goodRoutes);
app.use('/api', orderRoutes);
app.use('/api', feedbackRoutes);
app.use('/api', subscriptionRoutes);

if (isSwaggerEnabled) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Clothica API',
    documentation: isSwaggerEnabled ? '/api-docs' : null,
  });
});

app.post(
  '/api/telegram/webhook/:webhookSecret',
  verifyTelegramWebhook,
  (req, res) => {
    processTelegramUpdate(req.body);
    res.sendStatus(200);
  },
);

app.use(notFoundHandler);
app.use(errors());
app.use(errorHandler);

const startServer = async () => {
  await connectMongoDB();

  if (process.env.NODE_ENV === 'production') {
    await setupTelegramWebhook();
  }
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
startServer();
