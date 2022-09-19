const mongoose = require("mongoose");
const signOffSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Enter the custmers name"],
    set: firstName.charAt(0).toUpperCase() + firstName.slice(1),
    minlength: [1, "Name should one or more character"],
  },
  receiptNumber: {
    type: Number,
    required: [true, "Enter the receipt number"],
  },
  phone_number: {
    type: String,
    validate: {
      validator: function (v) {
        // return /\d{4}-\d{3}-\d{6}/.test(v); DDD - DDD - DDDD;
        return /(256)\d{3} \d{3} \d{3}/.test(v); //256DDD - DDDDDD eg 256781 950 912
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
    required: [true, "User phone number required"],
  },
  time: {
    // look at the time formats
    type: Time,
    require: [true, "Enter the time"],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  sex: {
    type: String,
    required: [true, "Provide the customer's sex"],
    enum: {
      value: ["male", "female"],
      message: "Sex is either male or female",
    },
  },
  ninNumber: {
    type: String,
    validate: {
      validator: function (v) {
        return /[A-Z]{2}[\d]{8}[A-Z]{2}\d{1}[A-Z]{1}/.test(v); // eg CM84674502WM5G
      },
      message: (props) => `${props.value} is not a valid NIN number!`,
    },
    required: [true, "Please the driver must contain the NIN number"],
  },
  date: Date.now(),
});

const signOff = mongoose.model("SignOff", signOffSchema);
module.exports = signOff;
