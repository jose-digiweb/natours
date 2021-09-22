//==> REQUESTING DEPENDENCIES
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

//==> REQUESTING OUR MODULES
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

////////////////////////////////////////////
////==> STARTING CODING THE PROJECT <==////

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//==> GLOBAL MIDDLEWARES
// SAVING STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));

// LET US DEFINE EXTRA HTTP HEADERS FOR MORE SECURITY
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// DEVELOPMENT CONSOLE LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// LIMITING THE REQUESTS FOR HOUR
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many requests from this IP address, please try again in an hour.',
});

app.use('/api', limiter);

// BODY PARSER, READING DATA FROM THE BODY INTO REQ.BODY
app.use(express.json({ limit: '10kb' })); // limit: Not accept body larger than 10kb
app.use(express.urlencoded({ extended: true, limit: '10kb' })); //
app.use(cookieParser()); // Parse the data from cookie

// DATA SANITIZATION AGAINST NoSQL QUERY INJECTION
app.use(mongoSanitize());

// DATA SANITIZATION AGAINST XSS
app.use(xss());

// PREVENTING PARAMETERS POLLUTION
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'startDates',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// COMPRESSING ALL THE TEXTS
app.use(compression());

//== ROUTES
// VIEW ROUTES
app.use('/', viewRouter);

// TOUR ROUTES
app.use('/api/v1/tours', tourRouter);

// USERS ROUTES
app.use('/api/v1/users', userRouter);

// REVIEW ROUTES
app.use('/api/v1/reviews', reviewRouter);

// BOOKING ROUTES
app.use('/api/v1/booking', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`We could not find ${req.originalUrl}, on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
