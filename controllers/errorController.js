const AppError = require("./../utils/appError");
//for invalid ID
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}:${err.velue}.`;
  return new AppError(message, 400);
};

//for duplicate fields
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicated field value: ${value} Please use another value `;
  return new AppError(message, 400);
};
//for validation
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired!, Please log in again.", 401);

const sendErrorDev = (err, req, res) => {
  //A) API
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack, //Showing where the error happened
    });
  }
  // B) FOR RENDERED WEBSITE
  console.error("ERROR 🎇", err); // console for errors

  return res.status(err.statusCode).render("error", {
    title: "Something went wrong",
    msg: err.message,
  });
};

//For production
const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // B) Programming or any other error
    //1.Logging error
    console.error("ERROR 🎇", err);
    //2.Send generic message
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
  // B) RENDERED WEBSITE
  //A//Operational, trusted: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong",
      msg: err.message,
    });
  }
  //B Programming or any othet error do not link the error details
  console.error("ERROR 🎇", err);
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong",
    msg: "Please try again later",
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
    //if we do not have the above ifs
    sendErrorProd(error, req, res);
  }
};
