const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const Email = require("./../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  //This enables user log in by sending the JWT
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  console.log("dealing with sign ups");
  console.log(req.body);
  const newUser = await User.create(
    // req.body
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      phone_number: req.body.phone_number,
    }
  );
  const verifyToken = newUser.createVerifyAccountToken();
  await newUser.save({ validateBeforeSave: false });
  try {
    const verifyurl = `${req.protocol}://${req.get(
      "host"
    )}/verify-account/${verifyToken}`;
    const subject = "Verify Account";
    const message = "Confirm its your account";
    await new Email(newUser, subject, message).sendVerifyAccount(verifyurl);
    res.status(201).json({
      status: "success",
      message: "User created please verify via your email ",
    });
  } catch (err) {
    (newUser.verifyAccountToken = undefined),
      (newUser.verifyAccountTokenExpires = undefined),
      await newUser.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again later", 500)
    );
  }
  // createSendToken(newUser, 201, res) not used because the tooken is sent through the url
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError("Please provide your email and password"));
  const user = await User.findOne({ email: email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  // if (user.isVerified === false)
  //   return next(new AppError("Please verify your account and try again", 403));
  createSendToken(user, 201, res);
  next();
});
