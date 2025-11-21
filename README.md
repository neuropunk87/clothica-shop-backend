# Clothica Backend API

Backend API for Clothica built with Node.js, Express and MongoDB.

## Features

- 🔐 JWT Authentication (Access & Refresh Tokens)
- 🛡️ Security (Helmet, CORS, Rate Limiting)
- ✅ Request Validation (Celebrate/Joi)
- 📚 API Documentation (Swagger)
- 🏗️ Functional Architecture
- 🔄 Centralized Error Handling

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **Validation:** Celebrate (Joi wrapper)
- **Security:** Helmet, CORS, express-rate-limit
- **Documentation:** Swagger (swagger-jsdoc, swagger-ui-express)
- **Module System:** ES Modules (type: "module")
- **Architecture:** Functional Programming

## Project Structure

```
clothica-shop-backend/
├── src/
│   ├── server.js
│   ├── admin/
│   ├── admin.config.js
│   ├── auth.js
│   ├── resources.js
│   ├── constants/
│   │   ├── colors.js
│   │   ├── orderStatuses.js
│   │   └── time.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── categoryController.js
│   │   ├── goodController.js
│   │   ├── orderController.js
│   │   ├── feedbackController.js
│   │   └── subscriptionController.js
│   ├── db/
│   │   └── connectMongoDB.js
│   ├── middleware/
│   │   ├── authenticate.js
│   │   ├── logger.js
│   │   ├── errorHandler.js
│   │   ├── notFoundHandler.js
│   │   ├── rateLimitAuth.js
│   │   ├── rateLimitSearch.js
│   │   ├── requireAdmin.js
│   │   ├── processCategoryFilter.js
│   │   └── multer.js
│   ├── models/
│   │   ├── user.js
│   │   ├── session.js
│   │   ├── category.js
│   │   ├── good.js
│   │   ├── order.js
│   │   ├── feedback.js
│   │   ├── subscription.js
│   │   └── counter.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── goodRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── feedbackRoutes.js
│   │   └── subscriptionRoutes.js
│   ├── seeds/
│   │   └── setCounter.js
│   ├── services/
│   │   ├── auth.js
│   │   └── telegram.js
│   ├── templates/
│   │   └── reset-password-email.html
│   ├── utils/
│   │   ├── ctrlWrapper.js
│   │   ├── modifyFileToCloudinary.js
│   │   └── sendMail.js
│   ├── validations/
│   │   ├── authValidation.js
│   │   ├── categoriesValidation.js
│   │   ├── goodsValidation.js
│   │   ├── ordersValidation.js
│   │   ├── feedbacksValidation.js
│   └── └── subscriptionsValidation.js
├── config/
│   └── swagger.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd clothica-shop-backend
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
cp .env.example .env
```

4. Configure environment variables in `.env`.

### Running the Application

Development mode with auto-restart:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## API Documentation

Once the server is running, access the Swagger documentation at:

```
/api-docs
```

## API Endpoints

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `POST /api/auth/request-password-reset`
- `POST /api/auth/reset-password`

### Users (Protected)

- `GET /api/users/profile`
- `PATCH /api/users/profile`
- `DELETE /api/users/profile`
- `GET /api/users/profile/telegram-link`

### Categories

- `GET /api/categories`
- `GET /api/categories/:id`
- `POST /api/categories`
- `PATCH /api/categories/:id`
- `DELETE /api/categories/:id`
- `PATCH /api/categories/:id/img`

### Goods

- `GET /api/goods`
- `GET /api/goods/:id`
- `POST /api/goods`
- `PATCH /api/goods/:id`
- `DELETE /api/goods/:id`

### Orders (All Protected)

- `GET /api/orders`
- `POST /api/orders`
- `PATCH /api/orders/:id/status`

### Feedbacks

- `GET /api/feedbacks`
- `POST /api/feedbacks`

### Subscriptions

- `POST /api/subscriptions`

## Security Features

### Rate Limiting

Authentication endpoints (`/register` and `/login`) are rate-limited to 10 requests per 15 minutes per IP address to prevent brute-force attacks.

### Password Security

- Passwords are hashed using bcrypt with salt rounds
- Minimum password length: 8 characters
- Maximum password length: 128 characters

### JWT Authentication

- Access tokens expire in 15 minutes
- Refresh tokens expire in 1 day
- Tokens are verified on protected routes

### HTTP Security

- Helmet middleware sets secure HTTP headers
- CORS configured for cross-origin requests

## Validation Rules

### Registration

- **name**: Required, string, max 32 characters
- **phone**: Required, string, max 13 characters
- **password**: Required, string, min 8 characters, max 128 characters

### Login

- **phone**: Required, string, max 13 characters
- **password**: Required, string

## Error Handling

The API uses centralized error handling with consistent error responses:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [...]  // Optional validation errors
}
```

Common HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Development Notes

### Architecture

This project follows a **functional programming approach**:

- **Controllers**: Pure functions that handle requests and responses
- **Services**: Pure functions that contain business logic
- **Models**: Mongoose schemas with named exports
- **Middleware**: Functions for request processing
- **Error Handling**: Centralized with `ctrlWrapper` utility
