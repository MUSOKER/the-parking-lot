const mongoose = require("mongoose");
const validator = require("validator");
const Ride = require("./rideModel");
const Parking = require("./parkingModel");
const User = require("./userModel");

const customerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    minlength: [1, "Name should contain one or more character"],
    required: [true, "Please enter Customer's first name!"],
    validate: {
      validator: function (v) {
        return /[A-Z]{1}[A-Za-z]/.test(v); // Musoke
      },
      message: (props) =>
        `${props.value} invalid, Name should start with capital letter!`,
    },
  },
  lastName: {
    type: String,
    minlength: [1, "Name should contain one or more character"],
    required: [true, "Please enter customer's last name!"],
    validate: {
      validator: function (x) {
        return /[A-Z]{1}[A-Za-z]/.test(x); // Musoke
      },
      message: (props) =>
        `${props.value} invalid, Name should start with capital letter!`,
    },
  },
  sex: {
    type: String,
    required: [true, "Provide the customer's sex"],
    enum: {
      values: ["male", "female"],
      message: "Sex is either male or female",
    },
  },
  email: {
    type: String,
    required: [true, "Please enter your email address!"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  ninNumber: {
    type: String,
    validate: {
      validator: function (v) {
        return /(CM)[\d]{8}[A-Z]{2}\d{1}[A-Z]{1}/.test(v); // eg CM84674502WM5G
      },
      message: (props) => `${props.value} is not a valid NIN number!`,
    },
    required: [true, "Please the driver must contain the NIN number"],
  },
  typeOfRide: {
    type: String,
    required: [true, "indicate the type of ride"],
    enum: {
      values: ["truck", "personal car", "taxis", "coaster", "boda-boda"],
      message:
        "typeOfRide is either: truck, personal car, taxis, coaster or boda-boda",
    },
  },
  carModel: {
    type: String,
    required: [true, "Car must have a model"],
  },
  Date: {
    type: Date,
    default: Date.now(),
  },
  phone_number: {
    type: String,
    validate: {
      validator: function (v) {
        // return /\d{4}-\d{3}-\d{6}/.test(v); DDD - DDD - DDDD;
        return /(256)\d{3} \d{3} \d{3}/.test(v); //256DDD - DDDDDD eg +256 781 950 912
      },
      message: (props) =>
        `${props.value} is not a valid phone number! Use +256*** *** *** format`,
    },
    required: [true, "Customer's phone number required"],
  },
  parkingTimes: {
    type: String,
    default: "Below 3 hours",
    enum: {
      values: ["night", "day", "Below 3 hours"],
      message: "Time is either day or night",
    },
  },
  parkCharge: {
    // type: mongoose.Schema.ObjectId,
    // ref: "Parking",
    type: Number,
    default: function () {
      let result;
      if (this.typeOfRide === "truck" && this.parkingTimes === "day") {
        result = 5000;
      } else if (this.typeOfRide === "truck" && this.parkingTimes === "night") {
        result = 10000;
      } else if (
        (this.typeOfRide === "personal car" && this.parkingTimes === "day") ||
        (this.typeOfRide === "taxis" && this.parkingTimes === "day")
      ) {
        result = 3000;
      } else if (
        (this.typeOfRide === "personal car" && this.parkingTimes === "night") ||
        (this.typeOfRide === "taxis" && this.parkingTimes === "night") ||
        (this.typeOfRide === "coaster" && this.parkingTimes === "night") ||
        (this.typeOfRide === "boda-boda" && this.parkingTimes === "night")
      ) {
        result = 2000;
      } else if (this.typeOfRide === "coaster" && this.parkingTimes === "day") {
        result = 4000;
      } else if (
        this.typeOfRide === "boda-boda" &&
        this.parkingTimes === "day"
      ) {
        result = 2000;
      } else {
        result = 1000;
      } //for every ride parking below 3 hrs pays 1000
      return result;
    },
  },
  providedNumber: {
    type: Number,
    default: Math.floor(Math.random() * 100 + 1),
  },
  // {
  //   type: String,
  //   required: [true, "Provide the issued unique number given to the customer"],
  // },
  receiptNo: {
    type: String,
    required: [true, "Provide the receipt number"],
  },
  //OTHER SERVICES
  //Tyre buying
  //Tyre services
  //Battery buying
  created_by: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  paid: {
    type: Boolean,
    default: true,
  },

  isSignedOff: {
    type: Boolean,
    default: false,
    select: false,
  },
});

customerSchema.pre(/^find/, function (next) {
  this.populate({
    path: "created_by",
    select: "firstName",
  });
  next();
});

customerSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ isSignedOff: { $ne: true } });
  next();
});
const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;
