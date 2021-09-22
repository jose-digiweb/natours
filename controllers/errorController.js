/* eslint-disable prettier/prettier */
const AppError = require('../utils/appError');
const {
  handleCastErrorDB,
  handleDuplicatedFieldDB,
  handleValidationErrorDB,
  handleJwtExpiredError,
  handleJwtError,
} = require('../utils/errorHandling');

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // RENDERED WEBSITE
    console.error('ERROR 🔥', err);

    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    if (err.name === 'CastError') return handleCastErrorDB(err, req, res);

    if (err.code === 11000) return handleDuplicatedFieldDB(err, req, res);

    if (err.name === 'ValidationError') return handleValidationErrorDB(err, req, res);

    if (err.name === 'JsonWebTokenError') return handleJwtError(err, req, res);

    if (err.name === 'TokenExpiredError') return handleJwtExpiredError(err, req, res);

    console.error('ERROR 🔥', err);

    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
  // rendered website
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }

  if (err.name === 'CastError') return handleCastErrorDB(err, req, res);

  if (err.code === 11000) return handleDuplicatedFieldDB(err, req, res);

  if (err.name === 'ValidationError') return handleValidationErrorDB(err, req, res);

  if (err.name === 'JsonWebTokenError') return handleJwtError(err, req, res);

  if (err.name === 'TokenExpiredError') return handleJwtExpiredError(err, req, res);

  console.error('ERROR 🔥', err);

  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'Please try again later',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    sendErrorProd(err, req, res);
  }
};
