const catchAsync = require("./../utils/catchAsync");
const Battery = require("./../models/batteryModel");
const AppError = require("./../utils/appError");

exports.dailyBatterySales = async (req, res) => {
  try {
    const daily = await Battery.aggregate([
      {
        $match: {
          date: {
            $gte: new Date("2022-01-01T17:10:29.609+00:00"),
            $lt: new Date("2030-01-01T17:10:29.609+00:00"),
          },
        }, //from 2022 to 2030
      },
      // Second Stage
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalBatterySales: {
            $sum: "$batteryPrice",
          },
          //  averageQuantity: { $avg: "$quantity" },
          count: { $sum: 1 },
        },
      },
      {
        $addFields: {
          date: "$_id",
          NumberOfCustomers: "$count",
          totalSalesInBattery: "$totalBatterySales",
        },
      },
      {
        $project: {
          _id: 0,
          count: 0,
          totalBatterySales: 0,
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
exports.dailyBatteryCustomers = async (req, res) => {
  try {
    const daily = await Battery.aggregate([
      {
        $match: {
          date: {
            $gte: new Date("2022-01-01T17:10:29.609+00:00"),
            $lt: new Date("2030-01-01T17:10:29.609+00:00"),
          },
        }, //from 2022 to 2030
      },
      // Second Stage
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          
          //  averageQuantity: { $avg: "$quantity" },
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
      data: daily,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.batteryOrder = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const battery = await Battery.create(req.body);
  if (!battery)
    return next(new AppError("Please attach the tyre concerns", 404));
  res.status(200).json({
    status: "success",
    data: battery,
  });
});

exports.getAllBattery = catchAsync(async (req, res, next) => {
  const battery = await Battery.find();
  res.status(200).json({
    status: "success",
    battery,
  });
});

exports.getBatteryRequest = catchAsync(async (req, res, next) => {
  const documentID = req.params.id;

  if (!documentID) return next(new AppError("document id not supplied", 404));
  const batteryDetails = await Battery.findById(documentID);
  res.status(200).json({
    status: "success",
    batteryDetails,
  });
});

exports.updateBatteryOrder = catchAsync(async (req, res, next) => {
  const doc = await Battery.findByIdAndUpdate(
    req.params.id,
    {
      batterySize: req.body.batterySize,
      batteryPrice: req.body.batteryPrice,
      customer: req.body.customer, 
    },

    { new: true, runValidators: true }
  );

  if (!doc) {
    return next(new AppError("No document found with that id", 404));
  }
  res.status(200).json({
    status: "success",
    doc,
  });
});

exports.deleteBatteryOrder = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const doc = await Battery.findByIdAndDelete(id);
  if (!doc) return next(new AppError("no document with that id found"));
  res.status(204).json({
    status: "success",
    data: null,
  });
})
