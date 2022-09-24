const catchAsync = require("./../utils/catchAsync");
const Customer = require("./../models/customerModel");
const AppError = require("./../utils/appError");

exports.createCustomer = catchAsync(async (req, res, next) => {
  console.log("Entering the customer");
  const customer = await Customer.create(req.body);
  res.status(200).json({
    status: "success",
    data: customer,
  });
});
