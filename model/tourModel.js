//==> Requiring Dependencies
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

//--> Creating a DB a Schema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: true,

      // VALIDATORS
      required: [true, `The tour must have a "Name"`],
      maxLength: [40, 'The tour name must have less or equal than 40 characters'],
      minLength: [5, 'The tour name must have at least 5 characters'],
    },
    slug: String,
    duration: {
      type: Number,

      // VALIDATORS
      required: [true, `The tour must have a "Duration"`],
    },
    maxGroupSize: {
      type: Number,

      // VALIDATORS
      required: [true, `The tour must have a "Group Size"`],
    },
    difficulty: {
      type: String,

      // VALIDATORS
      required: [true, `The tour must have a "Difficulty"`],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'the difficulty must be either: easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 3.5,

      // VALIDATORS
      min: [1, 'The rating must be equal or more than 1.0'],
      max: [5, 'The rating must be equal or less than 5.0'],

      set: (value) => Math.round(value * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,

      // VALIDATORS
      required: [true, `The tour must have a "Price"`],
    },
    priceDiscount: {
      type: Number,

      // VALIDATORS
      validate: {
        validator: function (val) {
          return val < this.price;
        },

        message: 'The discount amount: ({VALUE}), must be lower than price',
      },
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,

      // VALIDATORS
      required: [true, `The tour must have a "Description"`],
    },
    imageCover: {
      type: String,

      // VALIDATORS
      required: [true, `The tour must have a "Image Cover"`],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },

    //==> EMBEDDED SCHEMA FOR TOUR LOCATION - IN "GeoJSON" FORMAT
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

//--> DOCUMENT MIDDLEWARE
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });

  next();
});

//--> VIRTUAL MIDDLEWARE
// VIRTUAL POPULATE
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//--> QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });

  next();
});

//--> AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

//   next();
// });

//--> CREATING A MODEL FORM THE SCHEMA
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
