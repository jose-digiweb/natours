const express = require('express');
const {
  getReviews,
  setTourUserIds,
  createReview,
  deleteReview,
  updateReview,
  getReview,
} = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');

//==> CREATING ROUTER FOR THE REVIEWS
const router = express.Router({ mergeParams: true });

router.use(protect);
router.route('/').get(getReviews).post(restrictTo('user'), setTourUserIds, createReview);

router
  .route('/:id')
  .get(getReview)
  .patch(restrictTo('admin', 'user'), updateReview)
  .delete(restrictTo('admin', 'user'), deleteReview);

module.exports = router;
