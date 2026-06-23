# Clothica Shop Backend

Production-oriented backend for the Clothica e-commerce platform. The project exposes a public REST API, a protected AdminJS back office, MongoDB persistence, Telegram account/password flows, Cloudinary image uploads and Resend email delivery.

## Current Stack

- Runtime: Node.js, ES Modules
- API: Express 5
- Database: MongoDB with Mongoose 8
- Admin: AdminJS 7 with Mongo-backed sessions
- Auth: opaque cookie sessions stored as server-side HMAC hashes
- Validation: Celebrate/Joi
- Security: Helmet, CORS allowlist, Origin/Referer CSRF checks, rate limiting, redacted logs
- Integrations: Telegram Bot API, Cloudinary, Resend
- Documentation: Swagger UI, Markdown docs

## Documentation

- [API Reference](docs/API.md)
- [Security Guide](docs/SECURITY.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Architecture Guide](docs/ARCHITECTURE.md)

Swagger is available at `/api-docs` in development. In production it is disabled by default and can be enabled with `ENABLE_SWAGGER=true`.

## Main Entry Points

| Surface | Path | Purpose |
| --- | --- | --- |
| Public/API | `/api/*` | Storefront API for auth, catalog, orders, feedbacks and subscriptions |
| Admin panel | `/admin` | AdminJS back office for users, goods, categories, orders and other resources |
| Swagger UI | `/api-docs` | Interactive API documentation, development-first |
| Telegram webhook | `/api/telegram/webhook/:webhookSecret` | Telegram Bot API webhook with header secret verification |

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

The API starts on `PORT` or `3030` by default. Configure MongoDB and secrets in `.env` before using protected flows.

## Required Local Services

- MongoDB instance
- Telegram bot only if account linking/password reset is needed
- Cloudinary only if category/avatar image uploads are used
- Resend only if newsletter welcome emails should be sent

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start API with nodemon |
| `npm start` | Start API with Node |
| `npm run create-admin` | Create or update an admin user from env variables |
| `npm run lint:check` | Run ESLint for the backend |
| `npm run audit:security` | Run high-severity npm audit |
| `npm test` | Placeholder, no automated test suite is currently configured |

Nested AdminJS package:

```bash
cd clothica-shop
npm install
npm run build
npm run lint
npm start
```

## Admin User Creation

If an admin already exists in MongoDB, this step is not required for normal
startup. Use it only for first-time bootstrap or emergency password recovery.

Set these variables in `.env` or in the current shell:

```env
ADMIN_PHONE=+380991234567
ADMIN_PASSWORD=replace-with-a-strong-password
# Optional. Existing users keep their current name when ADMIN_NAME is omitted.
ADMIN_NAME=Admin
```

Then run:

```bash
npm run create-admin
```

The script hashes the password with the same bcrypt policy used by the API and
upserts the user with `role: "admin"`. For existing users it updates the
password and role; it updates the name only when `ADMIN_NAME` is provided.

## Authentication Model

The API does not use JWTs. Authentication is cookie-based:

- `accessToken`: HTTP-only short-lived token
- `refreshToken`: HTTP-only refresh token
- `sessionId`: HTTP-only session identifier

Only HMAC hashes of access/refresh tokens are stored in MongoDB. Session refresh rotates tokens and replaces the old session.

## Security Highlights

- Production startup fails if required secrets are missing or weak.
- CORS is allowlisted in production.
- Mutating requests are protected by Origin/Referer CSRF checks.
- AdminJS uses Mongo-backed sessions, secure cookies and login attempt rate limiting.
- Password reset codes and Telegram link tokens are stored as HMAC hashes.
- Telegram webhooks require both a secret URL segment and the Telegram secret header.
- Public write endpoints are rate-limited.
- Uploads accept only whitelisted image MIME types/extensions.
- Request logs redact cookies, auth headers and Telegram webhook secrets.

Read the full [Security Guide](docs/SECURITY.md) before production deployment.

## API Overview

| Resource | Public | Authenticated | Admin |
| --- | --- | --- | --- |
| Auth | register, login, refresh, password reset request/submit | logout | - |
| Users | - | profile read/update/delete, Telegram link | - |
| Categories | list, details | - | create, update, delete, image upload |
| Goods | list, details | - | create, update, delete |
| Orders | create | current user's orders | update status |
| Feedbacks | list, create as guest | optional future user association | - |
| Subscriptions | subscribe | - | AdminJS resource |

Orders are public to create, but the final `sum` is recalculated server-side from current product prices. Client-provided order totals are accepted only for compatibility and are not trusted.

## Environment

Use `.env.example` as the canonical list of supported variables. Production requires at least:

- `NODE_ENV=production`
- `MONGO_URL`
- `ADMIN_SESSION_SECRET`
- `ADMIN_COOKIE_SECRET`
- `SESSION_TOKEN_SECRET`
- at least one frontend/backend origin via `CLIENT_URL`, `CLIENT_URLS`, `API_URL`, `BACKEND_URL` or `RENDER_EXTERNAL_URL`

Telegram production webhooks additionally require:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- `RENDER_EXTERNAL_URL`

See [Deployment Guide](docs/DEPLOYMENT.md) for the complete table and deployment checklist.

## Project Structure

```text
clothica-shop-backend/
├── config/                 # Swagger configuration
├── docs/                   # Human-readable project documentation
├── public/                 # Static assets used by AdminJS/API
├── src/
│   ├── admin/              # AdminJS resources and auth
│   ├── config/             # i18n and security config
│   ├── constants/          # Shared constants
│   ├── controllers/        # Request handlers
│   ├── db/                 # MongoDB connection
│   ├── middleware/         # Auth, security, logging, rate limiting
│   ├── models/             # Mongoose models
│   ├── routes/             # Express routers and Swagger comments
│   ├── scripts/            # Operational scripts
│   ├── services/           # Auth, Telegram and integration logic
│   ├── templates/          # Email templates
│   ├── utils/              # Shared helpers
│   └── validations/        # Celebrate/Joi schemas
└── clothica-shop/          # Standalone AdminJS runtime package
```

## Verification Commands

```bash
npm run lint:check
npm run audit:security
cd clothica-shop
npm run lint
npm run build
npm audit --audit-level=high
```

At the time of this documentation update, both root and nested package audits report `found 0 vulnerabilities`.
