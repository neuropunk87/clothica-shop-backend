import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Clothica API',
      version: '1.0.0',
      description:
        'Backend API for Clothica. Authentication uses HTTP-only session cookies; Swagger UI is enabled in development and can be enabled in production with ENABLE_SWAGGER=true.',
    },
    servers: [
      {
        url: `https://clothica-shop-backend.onrender.com`,
        description: 'Production server',
      },
      {
        url: `http://localhost:${process.env.PORT || 3030}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
          description:
            'HTTP-only accessToken cookie set by /api/auth/register, /api/auth/login and /api/auth/refresh.',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
