import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import { errors } from 'celebrate';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../config/swagger.js';
import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initTelegramBot } from './services/telegram.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import goodRoutes from './routes/goodRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';

const app = express();
const PORT = process.env.PORT ?? 3030;

app.set('trust proxy', 1);

app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(helmet());

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CLIENT_URL_2,
  process.env.CLIENT_URL_LOCAL,
].filter(Boolean);

if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push(process.env.CLIENT_URL_LOCAL);
}

const corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    if (!origin && process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
};
app.use(cors(corsOptions));

app.use(cookieParser());

app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);
app.use('/api', goodRoutes);
app.use('/api', orderRoutes);
app.use('/api', feedbackRoutes);
app.use('/api', subscriptionRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Clothica API',
    documentation: '/api-docs',
  });
});

app.use(notFoundHandler);
app.use(errors());
app.use(errorHandler);

await connectMongoDB();
initTelegramBot();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
