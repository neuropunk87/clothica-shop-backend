# Deployment Guide

This guide describes how to run Clothica Shop Backend locally and in production.

## Requirements

- Node.js 20+ recommended
- npm
- MongoDB database
- HTTPS-capable hosting platform for production
- Optional: Telegram bot, Cloudinary account, Resend account

## Install

Root API:

```bash
npm install
cp .env.example .env
```

Standalone AdminJS package:

```bash
cd clothica-shop
npm install
```

## Environment Variables

Use `.env.example` as the source of truth.

### Core

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | HTTP port, defaults to `3030` in code |
| `NODE_ENV` | Yes | `development` or `production` |
| `MONGO_URL` | Yes | MongoDB connection string |
| `JSON_BODY_LIMIT` | No | Express JSON body limit, default `100kb` |
| `URLENCODED_BODY_LIMIT` | No | URL-encoded body limit, default `50kb` |
| `URLENCODED_PARAMETER_LIMIT` | No | URL-encoded parameter limit, default `50` |

### Security

| Variable | Required | Description |
| --- | --- | --- |
| `ADMIN_SESSION_SECRET` | Production | Express-session secret for AdminJS |
| `ADMIN_COOKIE_SECRET` | Production | AdminJS auth cookie secret |
| `SESSION_TOKEN_SECRET` | Production | HMAC secret for API tokens, reset codes and Telegram link tokens |
| `BCRYPT_SALT_ROUNDS` | No | Bcrypt cost, clamped to `10-14`, default `12` |
| `COOKIE_SECURE` | No | Force secure cookies outside production |
| `COOKIE_SAME_SITE` | No | `lax`, `strict` or `none` |
| `CSRF_ORIGIN_CHECK` | No | `strict`, `session` or `off` |
| `ENABLE_SWAGGER` | No | Set `true` to expose Swagger in production |

Generate strong secrets:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

### Admin Bootstrap

| Variable | Required for `npm run create-admin` | Description |
| --- | --- | --- |
| `ADMIN_PHONE` | Yes | Admin phone in `+380XXXXXXXXX` format |
| `ADMIN_PASSWORD` | Yes | Strong password, 10-128 characters |
| `ADMIN_NAME` | No | Admin display name. Existing users keep their current name when omitted; new users default to `Admin` |

### Origins and URLs

| Variable | Required | Description |
| --- | --- | --- |
| `CLIENT_URL` | Production | Primary storefront/admin frontend origin |
| `CLIENT_URL_2` | No | Secondary trusted origin |
| `CLIENT_URL_LOCAL` | No | Local trusted origin |
| `CLIENT_URLS` | No | Comma-separated trusted origins |
| `API_URL` | No | API origin, useful for same-deployment admin flows |
| `BACKEND_URL` | No | Backend public origin |
| `RENDER_EXTERNAL_URL` | Telegram production | Public backend URL used for Telegram webhook registration |

At least one trusted origin is required in production.

### Telegram

| Variable | Required | Description |
| --- | --- | --- |
| `TELEGRAM_BOT_TOKEN` | If Telegram is enabled | Bot token from BotFather |
| `TELEGRAM_BOT_USERNAME` | For account linking links | Bot username without `@` |
| `TELEGRAM_WEBHOOK_PATH_SECRET` | No | Optional separate secret URL segment; falls back to bot token |
| `TELEGRAM_WEBHOOK_SECRET` | Production with Telegram | Telegram header secret token |

### Email

| Variable | Required | Description |
| --- | --- | --- |
| `RESEND_API_KEY` | If email sending is enabled | Resend API key |
| `RESEND_FROM_EMAIL` | Recommended | Sender address, e.g. `Clothica <noreply@example.com>` |

### Cloudinary

| Variable | Required | Description |
| --- | --- | --- |
| `CLOUDINARY_CLOUD_NAME` | If uploads are used | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | If uploads are used | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | If uploads are used | Cloudinary API secret |

## Local Development

```bash
npm run dev
```

Useful URLs:

- API root: `http://localhost:3030/`
- Swagger: `http://localhost:3030/api-docs`
- AdminJS: `http://localhost:3030/admin`

If `PORT=3000`, replace `3030` with `3000`.

## Create Admin User

Skip this step if the database already has an admin account and you know its password.
Run it only for first-time bootstrap or password recovery.

Configure:

```env
ADMIN_PHONE=+380991234567
ADMIN_PASSWORD=replace-with-a-strong-password
# Optional for existing users
ADMIN_NAME=Admin
```

Run:

```bash
npm run create-admin
```

The command is idempotent: it creates the admin when missing or updates the
existing user with the same phone. Existing users get a new password and
`role: "admin"`; their name is changed only when `ADMIN_NAME` is provided.

## Production Deployment

1. Install dependencies:

```bash
npm ci
```

2. Configure environment variables.

3. Create or update the admin user if the database does not already contain one
   with known credentials:

```bash
npm run create-admin
```

4. Start the API:

```bash
npm start
```

5. Verify:

```bash
npm run lint:check
npm run audit:security
```

6. Open `/admin` and sign in with the admin credentials.

## Telegram Webhook

When `NODE_ENV=production`, the API registers the Telegram webhook on startup if `TELEGRAM_BOT_TOKEN` is configured.

Required:

- `RENDER_EXTERNAL_URL`
- `TELEGRAM_WEBHOOK_SECRET`
- `TELEGRAM_BOT_TOKEN`

Recommended:

- `TELEGRAM_WEBHOOK_PATH_SECRET`

The registered webhook URL is:

```text
<RENDER_EXTERNAL_URL>/api/telegram/webhook/<TELEGRAM_WEBHOOK_PATH_SECRET or TELEGRAM_BOT_TOKEN>
```

The API also verifies Telegram's `X-Telegram-Bot-Api-Secret-Token` header.

## Standalone AdminJS Runtime

The `clothica-shop/` folder contains a separate AdminJS runtime package. It shares the root Mongoose models and security helpers.

Build and run:

```bash
cd clothica-shop
npm ci
npm run build
npm start
```

Checks:

```bash
npm run lint
npm audit --audit-level=high
```

## Swagger in Production

Swagger is disabled in production unless explicitly enabled:

```env
ENABLE_SWAGGER=true
```

If enabled publicly, place it behind platform-level authentication or expose it only temporarily during controlled QA.

## Health Check

The root endpoint can be used as a simple health check:

```http
GET /
```

Expected response:

```json
{
  "success": true,
  "message": "Welcome to Clothica API",
  "documentation": null
}
```

When Swagger is enabled, `documentation` is `/api-docs`.

## Release Checklist

- Root `npm audit --audit-level=high` passes.
- `clothica-shop/npm audit --audit-level=high` passes.
- `npm run lint:check` passes.
- `cd clothica-shop && npm run lint && npm run build` passes.
- Required production secrets are configured.
- Trusted origins are correct.
- Admin user exists.
- Telegram webhook settings are correct if Telegram is enabled.
- Cloudinary and Resend credentials are correct if those integrations are enabled.
