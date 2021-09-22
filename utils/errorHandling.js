exports.handleCastErrorDB = (err, res) => {
  const message = `Invalid ${err.path}: ${err.value}.`;

  res.status(400).json({
    status: 'fail',
    message,
  });
};

exports.handleDuplicatedFieldDB = (err, res) => {
  const value = err.keyValue.name;

  const message = `The value specified: "${value}", already exist. please use a different value`;

  res.status(400).json({
    status: 'fail',
    message,
  });
};

exports.handleValidationErrorDB = (err, res) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  res.status(400).json({
    status: 'fail',
    message: `Invalid input data: ${errors.join('. ')}`,
  });
};

exports.handleJwtError = (err, res) => {
  const message = `Invalid token, please login again!`;

  res.status(401).json({
    status: 'fail',
    message,
  });
};

exports.handleJwtExpiredError = (err, res) => {
  const message = `Your token has expired, please login again!`;

  res.status(401).json({
    status: 'fail',
    message,
  });
};
