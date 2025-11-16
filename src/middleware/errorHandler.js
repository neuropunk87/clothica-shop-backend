export const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', err);
  }

  if (err.name === 'ValidationError') {
    if (process.env.NODE_ENV === 'production') {
      return res.status(400).json({
        success: false,
        message: 'Validation error. Please check your input data',
      });
    }
    const errors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors,
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      message: `${
        field.charAt(0).toUpperCase() + field.slice(1)
      } already exists`,
    });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({
      success: false,
      message: 'An unexpected internal server error occurred',
    });
  }

  res.status(500).json({
    success: false,
    message: err.message,
    stack: err.stack,
  });
};
