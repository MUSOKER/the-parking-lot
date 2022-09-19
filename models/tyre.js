const mongoose = require("mongoose");

const tyreSchema = new mongoose.Schema({
  //Car prices are pre entered in the system
  tyreSize: {
    type: Number,
    required: [true, "The tyre must contain a size"],
  },
  tyreMake: {
    type: String,
    required: [true, "Please incude the tyre make"],
  },
  carModel: {
    type: String,
    required: [true, "The car must contain its model"],
  },
  tyreMakeCharge: {
    enum: [500, 5000, 5000], // pressure, punture fixing, valve
    required: [true, "the tyre charge should be entered"],
  },
});

const Tyre = mongoose.model("Tyre", tyreSchema);
module.exports = Tyre;
