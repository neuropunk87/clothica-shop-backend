# Security Guide

This guide documents the current security posture of Clothica Shop Backend and the operational practices expected for production deployments.

## Security Goals

- Protect customer accounts and admin access.
- Avoid raw bearer token storage.
- Fail fast on unsafe production configuration.
- Reduce brute force, CSRF, CORS and upload abuse risk.
- Keep dependency and logging exposure under control.

## Session Security

Authentication uses opaque cookies, not JWTs.

Client cookies:

- `accessToken`
- `refreshToken`
- `sessionId`

Database storage:

- `accessTokenHash`: HMAC-SHA256 hash of the access token
- `refreshTokenHash`: HMAC-SHA256 hash of the refresh token
- expiration timestamps for access/refresh lifetimes

The raw token values are only sent to the browser as HTTP-only cookies. A database leak should not directly expose reusable access or refresh tokens without `SESSION_TOKEN_SECRET`.

## Cookie Policy

Session cookies are:

- `httpOnly: true`
- `sameSite`: controlled by `COOKIE_SAME_SITE`, defaults to `none` in production and `lax` in development
- `secure`: enabled in production
- `priority: high`

Production deployments must run behind HTTPS. If `SameSite=None` is used, secure cookies are mandatory.

## CSRF Protection

Mutating requests are checked with Origin/Referer validation:

- Safe methods `GET`, `HEAD`, `OPTIONS` are not checked.
- State-changing requests require an allowed origin in strict production mode.
- Same-origin admin requests are accepted.
- Telegram webhook route is excluded and protected separately.

Configuration:

| Variable | Values | Default |
| --- | --- | --- |
| `CSRF_ORIGIN_CHECK` | `strict`, `session`, `off` | `strict` in production, `session` in development |

Do not set `CSRF_ORIGIN_CHECK=off` in production unless another trusted gateway provides equivalent protection.

## CORS

Production CORS is allowlist-based. Configure trusted origins with:

- `CLIENT_URL`
- `CLIENT_URL_2`
- `CLIENT_URL_LOCAL`
- `CLIENT_URLS`
- `API_URL`
- `BACKEND_URL`
- `RENDER_EXTERNAL_URL`

`CLIENT_URLS` accepts a comma-separated list.

Requests without an `Origin` header are allowed to support non-browser clients, server-to-server requests and health checks.

## Passwords

- Passwords are hashed with bcrypt.
- Default cost is `12`.
- Allowed production range is controlled by `BCRYPT_SALT_ROUNDS`, clamped to `10-14`.
- New registration/reset passwords require 10-128 characters.
- Existing lower-cost bcrypt hashes are rehashed on successful login.

## Password Reset

Password reset uses Telegram-linked accounts:

- Reset codes are 6-digit numeric codes.
- Codes are sent through Telegram only when the account is linked.
- Codes are stored as HMAC hashes.
- Codes expire after 10 minutes.
- Failed attempts are counted and locked after 5 invalid attempts.
- Existing sessions are deleted after a successful password reset.

The response to password reset requests does not reveal whether the phone number exists or whether Telegram is linked.

## Telegram Security

Telegram has two separate security-sensitive flows.

### Account Linking

The profile endpoint generates a short-lived random link token:

```text
https://t.me/<bot>?start=<random-token>
```

Only an HMAC hash of that token is stored. The token expires after 10 minutes and is cleared after successful linking.

### Webhook

The webhook endpoint is:

```text
/api/telegram/webhook/:webhookSecret
```

Verification layers:

- constant-time comparison of `:webhookSecret`
- optional separate `TELEGRAM_WEBHOOK_PATH_SECRET`
- required production `TELEGRAM_WEBHOOK_SECRET`
- Telegram header `X-Telegram-Bot-Api-Secret-Token`

Webhook URLs are not logged.

## AdminJS Security

AdminJS is mounted at `/admin`.

Controls:

- Authenticated router.
- Only users with `role: "admin"` can sign in.
- Mongo-backed sessions via `connect-mongo`.
- `saveUninitialized: false`.
- `resave: false`.
- Secure HTTP-only cookies.
- Admin login attempt rate limiting.
- Admin password edits are hashed server-side before save.
- Password reset token fields are hidden from AdminJS views.

## Rate Limiting

| Limiter | Scope | Current default |
| --- | --- | --- |
| API limiter | `/api` | 300 requests / 15 minutes |
| Auth limiter | register/login by IP + phone | 10 attempts / 15 minutes |
| Password reset limiter | reset request/submit by IP + phone | 5 attempts / 15 minutes |
| Public write limiter | orders/feedbacks/subscriptions | 60 submissions / 15 minutes |
| Admin login limiter | `POST /admin/login` | 20 attempts / 15 minutes |
| Search limiter | product search requests | 30 search requests / minute |

## Upload Security

Uploads use Multer memory storage with:

- 2 MB file size limit
- MIME whitelist: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- extension whitelist: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`
- Cloudinary image upload as the final storage layer

Do not expose generic file upload endpoints without adding equivalent validation.

## Logging

The HTTP logger redacts:

- `Authorization`
- `Cookie`
- `Set-Cookie`
- `X-Telegram-Bot-Api-Secret-Token`

Telegram webhook requests are excluded from automatic request logging to avoid leaking secret URL segments.

## Dependency Security

Both package roots use npm overrides for patched transitive dependencies that are pulled through AdminJS or validation packages:

- `@tiptap/extension-link`
- `i18next-http-backend`
- `lodash`
- `tinymce`
- `uuid`

Run:

```bash
npm run audit:security
cd clothica-shop
npm audit --audit-level=high
```

Both audits should report `found 0 vulnerabilities`.

## Production Fail-Fast Checks

When `NODE_ENV=production`, startup fails if:

- `MONGO_URL` is missing.
- `ADMIN_SESSION_SECRET` is missing or weak.
- `ADMIN_COOKIE_SECRET` is missing or weak.
- `SESSION_TOKEN_SECRET` is missing or weak.
- no trusted origin is configured.
- Telegram webhook is enabled without `RENDER_EXTERNAL_URL`.
- Telegram webhook is enabled without `TELEGRAM_WEBHOOK_SECRET`.

Secrets are considered weak if they are shorter than 32 characters or contain placeholder-like values such as `secret`, `password`, `changeme` or `change-me`.

## Secret Rotation

Recommended rotation plan:

1. Rotate `ADMIN_SESSION_SECRET` and `ADMIN_COOKIE_SECRET` to invalidate AdminJS sessions.
2. Rotate `SESSION_TOKEN_SECRET` to invalidate all API sessions, password reset codes and Telegram link tokens.
3. Rotate `TELEGRAM_WEBHOOK_SECRET` in the deployment and re-register the webhook.
4. Rotate provider credentials in Cloudinary, Resend and Telegram if those systems may be affected.
5. Ask users to log in again after session secret rotation.

## Production Checklist

- `NODE_ENV=production`
- HTTPS enabled at the platform/load balancer.
- Strong secrets generated with a cryptographic random source.
- Correct CORS origins configured.
- `COOKIE_SAME_SITE` matches frontend/backend hosting topology.
- `TELEGRAM_WEBHOOK_SECRET` configured when Telegram is enabled.
- Swagger disabled unless intentionally exposed.
- `npm audit --audit-level=high` is clean in both package roots.
- Admin user created with a strong password.
- Database backups and restore process are tested.
