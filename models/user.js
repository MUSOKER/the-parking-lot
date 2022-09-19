const mongoose = require("mongoose");

const workersSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "Please enter your first name!"],
      set: first_name.charAt(0).toUpperCase() + first_name.slice(1),
      minlength: [1, "Name should one or more character"],
    },
    last_name: {
      type: String,
      require: [true, "Please enter your last name!"],
      set: last_name.charAt(0).toUpperCase() + last_name.slice(1),
      minlength: [1, "Name should one or more character"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email address!"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please enter a valid email"],
    },
    role: {
      type: String,
      enum: [
        "normalWorker",
        "batterySectionManager",
        "parkingSectionManager",
        "tyreSectionManager",
      ],
      default: "customer",
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
    ride: {
      type: mongoose.Schema.ObjectId,
      ref: "Ride",
    },
    battery: {
      type: mongoose.Schema.ObjectId,
      ref: "Battery",
    },
    parking: {
      type: mongoose.Schema.ObjectId,
      ref: "Parking",
    },
    tyre: {
      type: mongoose.Schema.ObjectId,
      ref: "Tyre",
    },
    image: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },

    password: {
      type: String,
      required: [true, "Please provide your password"],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      requred: [true, "Please confirm your password"],
      minlength: 8,
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same",
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String, //These be in the database
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true, //Hidding this property from the user
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
const Workers = mongoose.model("Workers", workersSchema);
module.exports = Workers;
