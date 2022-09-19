//extends eanble the appError inbuilt objects to inherit from the built in Error
class AppError extends Error {
  // A contructor function exectes when ever a class is called
  constructor(message, statusCode) {
    super(message);
    //creating a this object
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; //Must be an operational error
    Error.captureStackTrace(this, this.constructor); //Calling the created object and the methos
  }
}
module.exports = AppError;
