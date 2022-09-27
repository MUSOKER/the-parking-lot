const mongoose = require("mongoose");
const rideSchema = new mongoose.Schema({
  rideType: {
    // type: String,
    // required: [true, "indicate the type of ride"],
    // enum: {
    //   values: ["truck", "personal car", "taxis", "coaster", "boda-boda"],
    //   message:
    //     "typeOfRide is either: truck, personal car, taxis, coaster or boda-boda",
    // },
  },
  model: {
    // type: String,
    // required: [true, "Car must have a model"],
  },
});
const Ride = mongoose.model("Ride", rideSchema);
module.exports = Ride;
