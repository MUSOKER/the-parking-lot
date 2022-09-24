const mongoose = require("mongoose");
const Ride = require("./rideModel");

const parkingSchema = new mongoose.Schema({
  typeOfRide: {
    type: mongoose.Schema.ObjectId,
    ref: "Ride",
  },
  parkingTime: {
    type: String,
    enum: {
      values: ["night", "day"],
      message: "Time is either day or night",
    },
  },
  // releaseDate: {
  //   type: Date,
  //   default: function() {
  //     if (this.released) {
  //       return Date.now();
  //     }
  //     return null;
  //   }
  // }
  parkingCharge: {
    type: Number,
    default: function () {
      let result;
      if (this.typeOfRide === "truck" && this.parkingTime === "day") {
        result = 5000;
      } else if (this.typeOfRide === "truck" && this.parkingTime === "night") {
        result = 10000;
      } else if (
        this.typeOfRide === "personal car" ||
        ("taxis" && this.parkingTime === "day")
      ) {
        result = 3000;
      } else if (
        this.typeOfRide === "personal car" ||
        "taxis" ||
        "coaster" ||
        ("boda-boda" && this.parkingTime === "night")
      ) {
        result = 2000;
      } else if (
        this.typeOfRide === "coaster" &&
        this.parkingTime === "night"
      ) {
        result = 4000;
      } else if (
        this.typeOfRide === "boda-boda" &&
        this.parkingTime === "day"
      ) {
        result = 2000;
      } else {
        result = 1000;
      } //for every ride parking below 3 hrs pays 1000
      return result;
    },
  },
});

parkingSchema.pre("/^find/", function (next) {
  this.populate({
    path: "typeOfRide",
    select: "rideType",
  });
  next();
});

const Parking = mongoose.model("Parking", parkingSchema);
module.exports = Parking;
