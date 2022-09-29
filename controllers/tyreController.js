const catchAsync = require("./../utils/catchAsync");
const Tyre = require("./../models/tyreModel");
const AppError = require("./../utils/appError");

exports.dailyTyreSales = async (req, res) => {
  try {
    const daily = await Tyre.aggregate([
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
          totalTyreSales: {
            $sum: { $sum: ["$tyrePrice", "$tyreServiceCharge"] },
          },
          //  averageQuantity: { $avg: "$quantity" },
          count: { $sum: 1 },
        },
      },
      {
        $addFields: {
          date: "$_id",
          NumberOfCustomers: "$count",
          totalSalesInTyre: "$totalTyreSales",
        },
      },
      {
        $project: {
          _id: 0,
          count: 0,
          totalTyreSales: 0,
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
exports.dailyTyreCustomers = async (req, res) => {
  try {
    const daily = await Tyre.aggregate([
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
      data: daily,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.tyreRequest = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const tyre = await Tyre.create(req.body);
  if (!tyre) return next(new AppError("Please attach the tyre concerns", 404));
  res.status(200).json({
    status: "success",
    data: tyre,
  });
});

exports.getAlltyre = catchAsync(async (req, res, next) => {
  const tyres = await Tyre.find();
  res.status(200).json({
    status: "success",
    tyres,
  });
});

exports.getTyreRequest = catchAsync(async (req, res, next) => {
  const documentID = req.params.id;

  if (!documentID) return next(new AppError("document id not supplied", 404));
  const tyreDetails = await Tyre.findById(documentID);
  res.status(200).json({
    status: "success",
    tyreDetails,
  });
});

exports.updateTyreOrder = catchAsync(async (req, res, next) => {
  const doc = await Tyre.findByIdAndUpdate(
    req.params.id,
    {
      tyreSize: req.body.tyreSize,
      tyreMake: req.body.tyreMake,
      model: req.body.model,
      tyrePrice: req.body.tyrePrice,
      tyreService: req.body.tyreService,
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

exports.deleteTyreOrder = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const doc = await Tyre.findByIdAndDelete(id);
  if (!doc) return next(new AppError("no document with that id found"));
  res.status(204).json({
    status: "success",
    data: null,
  });
});
