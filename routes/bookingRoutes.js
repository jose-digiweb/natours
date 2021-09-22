const express = require('express');
const {
  getCheckoutSession,
  createBooking,
  getBookings,
  updateBooking,
  deleteBooking,
  getBooking,
} = require('../controllers/bookingController');
const { protect, restrictTo } = require('../controllers/authController');

//==> CREATING ROUTER FOR THE REVIEWS
const router = express.Router();

router.use(protect);
router.route('/checkout-session/:tourId').get(getCheckoutSession);

router.use(restrictTo('admin', 'lead-guide'));
router.route('/').get(getBookings).post(createBooking);
router.route('/:id').get(getBooking).patch(updateBooking).delete(deleteBooking);

module.exports = router;
