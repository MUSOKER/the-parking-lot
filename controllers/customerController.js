const catchAsync = require("./../utils/catchAsync");
const Customer = require("./../models/customerModel");
const AppError = require("./../utils/appError");

exports.createCustomer = catchAsync(async (req, res, next) => {
  console.log("Entering the customer");
  console.log(req.body);
  const customer = await Customer.create(
    req.body
    // {
    //   firstName: req.body.firstName,
    //   lastName: req.body.lastName,
    //   sex: req.body.sex,
    //   email: req.body.email,
    //   ninNumber: req.body.ninNumber,
    //   typeOfRide: req.body.typeOfRide,
    //   carModel: req.body.carModel,
    //   phone_number: req.body.phone_number,
    //   parkingTimes: req.body.parkingTimes,
    //   providedNumber: req.body.ProvidedNumber,
    //   receiptNo: req.body.receiptNo,
    //   created_by: req.body.created_by,
    // }
  );
  res.status(200).json({
    status: "success",
    data: customer,
  });
});

exports.deleteCustomer = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const doc = await Customer.findByIdAndDelete(id);
  if (!doc) return next(new AppError("no document with that id found", 404));
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getAllCustomers = catchAsync(async (req, res, next) => {
  const customers = await Customer.find();
  res.status(200).json({
    status: "success",
    customers,
  });
});
