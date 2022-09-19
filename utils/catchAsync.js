module.exports = (fn) => {
  return (req, res, next) => {
    //The function returns a promise
    //catching the promise
    //calling the return
    fn(req, res, next).catch(next); //Calling the function this next passes the error in the next function such that it goes in the error handling middleware
  };
};
