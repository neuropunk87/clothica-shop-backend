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
│   ├── constants/
│   │   ├── time.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── goodController.js
│   │   ├── categoryController.js
│   │   ├── orderController.js
│   │   └── reviewController.js
│   ├── db/
│   │   ├── connectMongoDB.js
│   ├── models/
│   │   ├── user.js
│   │   ├── session.js
│   │   ├── good.js
│   │   ├── category.js
│   │   ├── order.js
│   │   └── review.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── goodRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── orderRoutes.js
│   │   └── reviewRoutes.js
│   ├── services/
│   │   └── auth.js
│   ├── templates/
│   │   └── reset-password-email.html
│   ├── middleware/
│   │   ├── authenticate.js
│   │   ├── logger.js
│   │   ├── errorHandler.js
│   │   └── notFoundHandler.js
│   │   ├── rateLimitAuth.js
│   │   ├── rateLimitSearch.js
│   │   └── multer.js
│   ├── validations/
│   │   └── authValidation.js
│   ├── utils/
│   │   └── ctrlWrapper.js
│   │   └── saveFileToCloudinary.js
│   │   └── sendMail.js
│   └── constants/
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

### Users (Protected)

- `GET /api/users/profile`
- `PATCH /api/users/profile`
- `DELETE /api/users/profile`

### Goods

- `GET /api/goods`
- `GET /api/goods/:id`
- `POST /api/goods`
- `PATCH /api/goods/:id`
- `DELETE /api/goods/:id`

### Categories

- `GET /api/categories`
- `GET /api/categories/:id`
- `POST /api/categories`
- `PATCH /api/categories/:id`
- `DELETE /api/categories/:id`

### Orders (All Protected)

- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders`
- `PATCH /api/orders/:id`
- `DELETE /api/orders/:id`

### Reviews

- `GET /api/reviews`
- `GET /api/reviews/:id`
- `POST /api/reviews`
- `PATCH /api/reviews/:id`
- `DELETE /api/reviews/:id`

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
- **email**: Required, valid email format, max 64 characters
- **password**: Required, string, min 8 characters, max 128 characters

### Login

- **email**: Required, valid email format
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
