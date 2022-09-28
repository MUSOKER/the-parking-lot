const mongoose = require("mongoose");
const Customer = require("./customerModel");

const tyreSchema = new mongoose.Schema({
  //Car prices are pre entered in the system
  tyreSize: {
    type: String,
  },
  tyreMake: {
    type: String,
  },
  model: {
    type: String,
  },
  tyrePrice: {
    type: Number,
  },
  tyreService: {
    type: String,
    enum: ["tyre pressure", "puncture fixing", "valves"],
    message: "Service is either tyre pressure, puncture fixing or valves",
  },
  Date: {
    type: Date,
    default: Date.now(),
  },
  tyreServiceCharge: {
    type: Number,
    default: function () {
      let result;
      if (this.tyreService === "tyre pressure") result = 500;
      else if (this.tyreService === "puncture fixing") result = 5000;
      else result = 5000;
      return result;
    },
  },
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: "Customer",
  },
});

tyreSchema.pre(/^find/, function (next) {
  this.populate({
    path: "customer",
    select: "firstName",
  });
  next();
});

const Tyre = mongoose.model("Tyre", tyreSchema);
module.exports = Tyre;
