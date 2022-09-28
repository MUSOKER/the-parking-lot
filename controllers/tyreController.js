const catchAsync = require("./../utils/catchAsync");
const Tyre = require("./../models/tyreModel");
const AppError = require("./../utils/appError");

exports.tyreRequest = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const tyre = await Tyre.create(req.body);
  if (!tyre) return next(new AppError("Please attach the tyre concerns", 404));
  res.status(200).json({
    status: "success",
    data: tyre,
  });
});
