const crypto = require("crypto");
const { promisify } = require("util");
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

//The  user will be completely signed up after verifying
exports.signup = catchAsync(async (req, res, next) => {
  console.log("dealing with sign ups");
  console.log(req.body);

  const newUser = await User.create(
    req.body
    // {
    //   firstName: req.body.firstName,
    //   lastName: req.body.lastName,
    //   email: req.body.email,
    //   password: req.body.password,
    //   passwordConfirm: req.body.passwordConfirm,
    //   phone_number: req.body.phone_number,
    // }
  );
  const verifyToken = newUser.createVerifyAccountToken();
  await newUser.save({ validateBeforeSave: false });
  try {
    const verifyurl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/verifyAccount/${verifyToken}`;
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
  // user.isVerified === false  //When user clicks the verify button he will be automatically verified
  // createSendToken(newUser, 201, res) not used because the tooken is sent through the url
});

//to verify the user
exports.verifyAccount = catchAsync(async (req, res, next) => {
  const token = req.params.token;
  console.log(`the token is ${token}`);
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    verifyAccountToken: hashedToken,
    verifyAccountTokenExpires: { $gt: Date.now() },
  }).select("+isVerified");
  console.log("my user", user);
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.isVerified = true; //Sets the isVerified to true
  user.verifyAccountToken = undefined;
  user.verifyAccountTokenExpires = undefined;
  await user.save();
  await new Email(
    user,
    "welcome",
    "Lets work together",
    "Thank you"
  ).sendWelcome();

  createSendToken(user, 200, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError("Please provide your email and password"));
  const user = await User.findOne({ email: email }).select("+password");
  //+isVerified will be selected when in production

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  // if (user.isVerified === false)
  //   return next(new AppError("Please verify your account and try again", 403));
  createSendToken(user, 201, res); // logs in the user
  next();
});

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: "success",
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1.getting the token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  //token sent through cookie
  else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    next(
      new AppError("You are not logged in! Please log in to get access", 401)
    );
  }
  //2. Verification of the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);
  // 3. check if the user still exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token does nolonger exist", 401)
    );
  }
  //4. Check if user changed password after token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again", 401)
    );
  }
  //GRANT ACCESS TO PROTECTED ROUTES
  req.user = currentUser;
  res.locals.user = currentUser; //getting access to the user in the pug template
  next();
});

exports.restrictTo = (roles) => {
  return (req, res, next) => {
    //req.user is the current user
    console.log(`current user is ${req.user}`);
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

exports.resetPassword = catchAsync(async (req, res, next) => {
  //Token sent to the is unencrypted while that save in DB is encrypted
  // 1. Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2. If token has not expired, then there is a user, set the password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  // Setting the password but does not save
  //setting the db password to the new entered password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  // 3 Update the passwordChangedAt property
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save(); //here validators are run ie password=passwordConfirm
  //4 Log the user in, send the JWT
  createSendToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with email address.", 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    console.log("user is", user);

    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/resetPassword/${resetToken}`;
    const subject = "Reset Password";
    const message = "Request for password reset";
    console.log(`the reset token  on forgetting the password is ${resetToken}`);
    await new Email(user, subject, message).sendPasswordReset(resetURL);

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1 Get user from collection (already have  the current user on req object) and also obtain the password from DB (select)
  const user = await User.findById(req.user.id).select("+password");
  //2. Check if the POSTED current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong", 401));
  }
  //3 If password is correct, update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //4. log the user in, send JWT
  createSendToken(user, 201, res);
});

exports.updateUserRole = catchAsync(async (req, res, next) => {
  // 3) Update user document
  const user_id = req.body.user_id;
  const role = req.body.role;
  if (!role || !user_id)
    return next(new AppError("please provide user id and role", 400));
  const updatedUser = await User.findByIdAndUpdate(
    user_id,
    { role: role },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});
