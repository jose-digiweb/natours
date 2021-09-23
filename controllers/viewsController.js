const Tour = require('../model/tourModel');
const User = require('../model/userModel');
const Booking = require('../model/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.alerts = (req, res, next) => {
  const { alert } = req.query;

  if (alert === 'booking')
    // eslint-disable-next-line prettier/prettier
    res.locals.alert = `The tour was successfully booked! Please check your email for confirmation. If your booking doesn't shows up here immediately, please come back later.`;

  next();
};

exports.getOverview = catchAsync(async (req, res, next) => {
  // GET TOUR DATA FROM COLLECTION
  const tours = await Tour.find();

  // BUILD TEMPLATE
  // RENDER THE TEMPLATE USING THE TOUR DATA

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const slug = req.params.slug;

  const tour = await Tour.findOne({ slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = catchAsync(async (req, res) => {
  res.status(200).render('login', {
    title: `Log in to your account`,
  });
});

exports.getMyAccount = catchAsync(async (req, res) => {
  res.status(200).render('account', {
    title: `Your account`,
  });
});

// TO UPDATE USER DATA FOM FORM
exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render('account', {
    title: `Your account`,
    user: updatedUser,
  });
});

exports.getMyBookings = catchAsync(async (req, res, next) => {
  // FIND ALL BOOKINGS
  const bookings = await Booking.find({ user: req.user.id });

  // FIND TOURS WITH THE RETURNED ID'S
  const tourIDs = bookings.map((el) => el.tour);

  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    tile: 'My Tours',
    tours,
  });
});
