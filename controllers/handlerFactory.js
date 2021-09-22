const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.getAll = (model) => async (req, res, next) => {
  // TO ALLOW FOR NESTED GET REVIEWS ON TOUR
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };

  //--> QUERY FUNCTIONALITY
  const features = new APIFeatures(model.find(), req.query)
    .filter()
    .sorting()
    .fields()
    .pagination();

  const document = await features.query;

  //--> SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: document.length,
    data: {
      data: document,
    },
  });
};

exports.getOne = (model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = model.findById(req.params.id);

    if (populateOptions) query = query.populate(populateOptions);

    const document = await query;

    if (!document) {
      return next(new AppError('No document corresponds to the specified ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: document,
      },
    });
  });

exports.createOne = (model) =>
  catchAsync(async (req, res, next) => {
    const document = await model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: document,
      },
    });
  });

exports.updateOne = (model) =>
  catchAsync(async (req, res, next) => {
    const document = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Will return the updated tour
      runValidators: true,
    });

    if (!document) {
      return next(new AppError('No document corresponds to the specified ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: document,
      },
    });
  });

exports.deleteOne = (model) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document corresponds to the specified ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
