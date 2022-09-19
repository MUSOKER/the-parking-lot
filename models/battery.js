const mongoose = require("mongoose");

const batterySchema = new mongoose.batterySchema({
  //Restricted to only the section manager new car batteries
  batterySize: {
    type: Number,
    required: [true, "the battery size shoul be entered"],
  },
});

const Battery = mongoose.model("Battery", batterySchema);
module.exports = Battery;
