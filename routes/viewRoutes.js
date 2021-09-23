const express = require('express');
const { isLoggedIn, protect } = require('../controllers/authController');
const { createBookingCheckout } = require('../controllers/bookingController');
const { getMyBookings } = require('../controllers/viewsController');

const {
  getOverview,
  getTour,
  getLoginForm,
  getMyAccount,
} = require('../controllers/viewsController');

const router = express.Router();

router.get('/', isLoggedIn, getOverview);
router.get('/tour/:slug', isLoggedIn, getTour);
router.get('/login', isLoggedIn, getLoginForm);
router.get('/me', protect, getMyAccount);
router.get('/my-bookings', protect, getMyBookings);

module.exports = router;
