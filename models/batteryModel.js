const mongoose = require("mongoose");

const batterySchema = new mongoose.Schema({
  //Restricted to only the section manager new car batteries
  batterySize: {
    type: String,
    required: [true, "the battery size should be entered"],
  },
  batteryPrice: {
    type: Number,
    required: [true, "Emter the battery price"],
  },
  customer: {
    type: mongoose.Schema.ObjectId,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

batterySchema.pre(/^find/, function (next) {
  this.populate({
    path: "customer",
    select: "firstName",
  });
  next();
});
const Battery = mongoose.model("Battery", batterySchema);
module.exports = Battery;
