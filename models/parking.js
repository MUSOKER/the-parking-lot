const mongoose = require("mongoose");

const parkingSchema = new mongoose.Schema({
  typeOfRide: {
    enum: ["Truck", "Personal car", "Taxis", "Coaster", "Coaster", "Boda-boda"],
    required: [true, "Please provide your type of ride"],
  },
  NumberPlate: {
    type: String,
    validate: {
      validator: function (v) {
        return /^(U)[A-Za-z]{2}[\d]{3}[A-Za-z]{1}$/.test(v); // Starts with U ie UBM206K
      },
      message: (props) => `${props.value} is not a valid number plate!`,
    },
    required: [true, "Please provide the number plate"],
    max: [5, "Number plates should contain a maximum of 5 characters"],
  },
  carModel: {
    type: String,
    required: [
      true,
      "Please provide the model of either your car of boda-boda",
    ],
  },
  arrivalTime: {
    type: String,
    default: Date.now(),
    required: [true, "Please provide the arrival time"],
  },
  departureTime: {
    type: Date,
    required: [true, "Please provide the departure time"],
  },
  timeSpent: {
    //Do not forget forget to convert these to numbers cons numbers can be computed
    type: String,
    value: this.departureTime - this.arrivalTime,
  },
  ProvidedNumber: {
    type: Number,
    unique: true,
  },
});

const Parking = mongoose.model("Parking", parkingSchema);
module.exports = Parking;
