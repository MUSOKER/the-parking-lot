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
    type: mongoose.Schema.ObjectId,
    ref: "Ride",
    require: [true, "Enter the type of ride"],
  },
  carModel: {
    type: mongoose.Schema.ObjectId,
    ref: "Ride",
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
    type: mongoose.Schema.ObjectId,
    ref: "Parking",
    default: null,
    required: [true, "Provide the parking time, either day or night"],
  },
  parkCharge: {
    type: mongoose.Schema.ObjectId,
    ref: "Parking",
  },
  ProvidedNumber: {
    type: Number,
    unique: true,
    required: [true, "Provide the issued unique number given to the customer"],
  },
  receiptNo: {
    type: Number,
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

customerSchema.pre("/^find/", function (next) {
  this.populate({
    path: "carModel typeOfRide parkingTimes created_by parkCharge",
    select: "model rideType parkingTime firstName parkingCharge",
  });
  next();
});

customerSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ isSignedOff: { $ne: false } });
  next();
});
const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;
