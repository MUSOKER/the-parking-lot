const catchAsync = require("./../utils/catchAsync");
const Customer = require("./../models/customerModel");
const AppError = require("./../utils/appError");

exports.dailyParkingSales = async (req, res) => {
  try {
    const daily = await Customer.aggregate([
      {
        $match: {
          Date: {
            $gte: new Date("2022-01-01T17:10:29.609+00:00"),
            $lt: new Date("2030-01-01T17:10:29.609+00:00"),
          },
        }, //from 2022 to 2030
      },
      // Second Stage
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$Date" } },
          totalParkingSales: { $sum: "$parkCharge" },
          //  averageQuantity: { $avg: "$quantity" },
          count: { $sum: 1 },
        },
      },
      {
        $addFields: {
          date: "$_id",
          NumberOfCustomers: "$count",
          totalSalesInParking: "$totalParkingSales",
        },
      },
      {
        $project: {
          _id: 0,
          count: 0,
          totalParkingSales: 0,
        },
      },
      {
        $sort: { date: 1 },
      },
    ]);
    res.status(200).json({
      status: "success",
      data: daily,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.signOffCustomer = catchAsync(async (req, res, next) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) return next(new AppError("customer not found", 404));
  res.status(200).json({
    message: `Thank you our beloved customer, ${customer.firstName}`,
    firstName: customer.firstName,
    receiptNumber: customer.receiptNumber,
    phone_number: customer.phone_number,
    date: Date(Date.now),
    sex: customer.sex,
    ninNumber: customer.ninNumber,
  });
});
exports.signOffCustomerDB = catchAsync(async (req, res, next) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!customer) return next(new AppError("customer not found", 404));
  res.status(200).json({
    status: "success",
    data: customer,
  });
});

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

exports.noDailyCustomers = async (req, res) => {
  try {
    const noCustomers = await Customer.aggregate([
      {
        $match: {
          Date: {
            $gte: new Date("2022-01-01T17:10:29.609+00:00"),
            $lt: new Date("2030-01-01T17:10:29.609+00:00"),
          },
        }, //from 2022 to 2030
      },
      // Second Stage
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$Date" } },
          count: { $sum: 1 },
        },
      },
      {
        $addFields: {
          date: "$_id",
          NumberOfCustomers: "$count",
        },
      },
      {
        $project: {
          _id: 0,
          count: 0,
        },
      },
      {
        $sort: { date: 1 },
      },
    ]);
    res.status(200).json({
      status: "success",
      data: noCustomers,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

//Signed off custmers of all the the time
exports.signedOff = catchAsync(async (req, res, next) => {
  const signedOff = Customer.find({ isSignedOff: { $ne: false } });
  if (!signedOff) return next(new AppError("No signed off custmers", 404));
  res.status(200).json({
    status: "success",
    data: signedOff,
  });
});
