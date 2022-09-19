const catchAsync = require("./../utils/catchAsync");

// 1) deleting
const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        data: null,
      },
    });
  });

// 2) Creating
const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = Model.create(req.body);
    res.status(204).json({
      status: "success",
      data: doc,
    });
  });

// 3) Get
const getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id); //Creating a query object
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(204).json({
      status: "success",
      data: doc,
    });
  });
