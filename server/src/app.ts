import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import pinoHttp from 'pino-http';

import { ErrorCode } from '@shared/errors.js';

import { logger } from './lib/logger.js';
import { errorHandler } from './middleware/error-handler.js';
import { requestId } from './middleware/request-id.js';
import { apiRoutes } from './routes/index.js';

const app = express();
const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173';

// --- Security ---
app.use(helmet());
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
);

// --- Request processing ---
app.use(requestId);
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => req.url === '/api/health',
    },
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// --- Rate limiting ---
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    success: false,
    error: {
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
      message: 'Too many requests, please try again later',
    },
  },
});
app.use('/api', generalLimiter);

// --- Health check ---
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
});

// --- API routes ---
app.use('/api', apiRoutes);

// --- Error handling ---
app.use(errorHandler);

export { app };
