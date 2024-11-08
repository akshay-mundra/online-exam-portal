// throw custom error with message and statuscode
function throwCustomError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
}

// send response after error
function errorHandler(req, res, message, statusCode = 400) {
  message = message ? message : 'Something went wrong';

  res.status(statusCode).json({
    message,
  });
}

// send response if all good
function responseHandler(req, res) {
  const response = {
    data: res.data,
  };
  res.status(res.statusCode).json(response);
}

module.exports = {
  throwCustomError,
  errorHandler,
  responseHandler,
};
