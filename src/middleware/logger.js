import pino from 'pino-http';

export const logger = pino({
  level: 'info',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers["x-telegram-bot-api-secret-token"]',
      'res.headers["set-cookie"]',
    ],
    censor: '[REDACTED]',
  },
  autoLogging: {
    ignore: (req) => req.url.startsWith('/api/telegram/webhook/'),
  },
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname',
      messageFormat:
        '{req.method} {req.url} {res.statusCode} - {responseTime}ms',
      hideObject: true,
    },
  },
});
