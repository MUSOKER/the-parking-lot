const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      minlength: [1, "Name should contain one or more character"],
      required: [true, "Please enter your first name!"],
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
      required: [true, "Please enter your last name!"],
      validate: {
        validator: function (x) {
          return /[A-Z]{1}[A-Za-z]/.test(x); // Musoke
        },
        message: (props) =>
          `${props.value} invalid, Name should start with capital letter!`,
      },
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
        "receptionist",
        "batterySectionManager",
        "parkingSectionManager",
        "tyreSectionManager",
      ],
      default: "receptionist",
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
      required: [true, "User phone number required"],
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
      minlength: 7,
      select: false,
    },
    passwordConfirm: {
      type: String,
      requred: [true, "Please confirm your password"],
      minlength: 7,
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
    verifyAccountToken: String,
    verifyAccountTokenExpires: Date,
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

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
//For every query that starts with find eg findAdnUpdate
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } }); //find docs whose active is set to true
  next();
});
//INSTANCE METHODS
//provided password=hashed password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  //creating ie updating a field of passwordResetToken(has to be hashed) and passwordResetExpires in DB
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //Expires in 10 minutes
  return resetToken;
};
userSchema.methods.createVerifyAccountToken = function () {
  const verifyToken = crypto.randomBytes(32).toString("hex");
  this.verifyAccountToken = crypto
    .createHash("sha256")
    .update(verifyToken)
    .digest("hex");
  this.verifyAccountTokenExpires = Date.now() + 60 * 60 * 1000;
  return verifyToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
