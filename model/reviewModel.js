//==> Requiring Dependencies
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,

      // VALIDATORS
      required: [true, 'Review cannot be empty'],
      minLength: [10, 'The review must have at least 60 characters'],
      maxLength: [200, 'The review must have at least 60 characters'],
    },

    rating: {
      type: Number,

      // VALIDATORs
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to a user'],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Only one review for each user in a particular tour group
// Means that each combination between tour and user has to be unique.
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

//==> MIDDLE QUERIES
// POPULATING THE MODEL
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
    //
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// UPDATING THE REVIEW STATISTICS FOR CREATE METHOD
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.tour);
});

// UPDATING THE REVIEW STATISTICS FOR UPDATE METHOD
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();

  next();
});

// CONTINUATION OF UPDATING THE REVIEW STATISTICS FOR UPDATE METHOD
reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

//--> CREATING A MODEL FORM THE SCHEMA
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
