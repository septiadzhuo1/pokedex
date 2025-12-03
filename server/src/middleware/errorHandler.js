export const errorHandler = (err, _req, res, _next) => {
  console.error('Error:', err);

  if (err && err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      error: err.message,
    });
    return;
  }

  if (err && err.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: 'Invalid ID format',
      error: err.message,
    });
    return;
  }

  res.status((err && err.status) || 500).json({
    success: false,
    message: (err && err.message) || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
};
