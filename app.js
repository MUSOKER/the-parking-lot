const path = require("path"); //Used to manipulate path modules(no need to install it)
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser"); //Enable parse all cookies in the incoming request
const compression = require("compression"); // compresses responses

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController"); //Comes from error controller
const { status, json } = require("express/lib/response");

const userRouter = require("./routes/userRoutes"); //importing the userRoutes module
const customerRouter = require("./routes/customerRoutes"); //importing the userRoutes module

const app = express();

//cors
app.use(
  cors({
    credentials: true,
  })
);

//setting the view engine to pug
app.set("view engine", "pug");

//defining the folder in which the views are located
app.set("views", path.join(__dirname, "views"));

//GLOBAL MIDDLEWARES
//Accessing statics files
app.use(express.static(path.join(__dirname, "public")));

//for reading JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "45mb" }));

//secure HTTP headers
app.use(helmet());

if ((process.env.NODE_ENV = "development")) {
  app.use(morgan("dev"));
}

//OPTIONAL: limtimg requests from the same API
// const limiter = rateLimit({
//   max: 100,
//   windowsMs: 60 * 60 * 1000, // 100 requests per hour(milliseconds)
//   message: "Too many requests from this IP, please try again in one hour!",
// });
// app.use("/api", limiter);
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());

//Preventing parameter pollution
// app.use(
//   hpp({
//     whitelist: [
//       //list what should be contained in the search parameters eg duration, ratingsAvearge
//       "ratingsAverage",
//     ],
//   })
// );

//OPTIONAL: to compress the responses
app.use(compression());
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});

//ROUTES
app.use("/api/v1/users", userRouter); // A route with the route function
app.use("/api/v1/customers", customerRouter);

//to be used later
// app.use("/", viewRouter);
// app.use("/api/v1/users", userRouter);
//for all get, post, update requests typed wrongly
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find the ${req.originalUrl} on this server!`, 404));
});
app.use(globalErrorHandler);
module.exports = app;
