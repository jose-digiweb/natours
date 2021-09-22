const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,

      // VALIDATORS
      required: [true, 'Please tell us your name!'],
    },
    email: {
      type: String,
      lowercase: true,

      // VALIDATORS
      required: [true, 'Please provide your email address!'],
      unique: [true, 'the email already exists!'],
      validate: [validator.isEmail, 'Please provide a valid email address!'],
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    role: {
      type: String,

      // VALIDATORS
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      select: false,

      // VALIDATORS
      required: [true, 'Please define your password!'],
      minlength: 8,
    },
    passwordConfirm: {
      type: String,

      // VALIDATORS
      required: [true, 'Please confirm your password!'],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords did not match',
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//==> ENCRYPTING THE PASSWORD
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;

  next();
});

//==> UPDATING THE passwordChangedAt PROPERTY
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; // -1000 IS TO GIVE SOME WINDOW TIME

  next();
});

// QUERY MIDDLEWARE TO PREVENT THE DELETED USER FROM SHOWING IN THE DATABASE
userSchema.pre(/^find/, function (next) {
  // This. POINTS TO THE CURRENT QUERY
  this.find({ active: { $ne: false } });

  next();
});

//==> VALIDATING THE PASSWORD TO LOGIN THE USER
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

//==> CHECK IF USER CHANGED HIS PASSWORD
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return JWTTimestamp < changedTimeStamp;
  }

  // MEANS THAT THE PASSWORD WAS NOT CHANGED
  return false;
};

//==> CREATE PASSWORD RESET TOKEN
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 min

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
