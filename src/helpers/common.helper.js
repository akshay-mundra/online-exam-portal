const { SUPER_ADMIN, ADMIN, USER } =
  require('../constants/common.constant').roles;

// throw custom error with message and statuscode
function throwCustomError(message, statusCode = 400, isCustom = false) {
  const err = new Error(message);
  err.statusCode = statusCode;
  if (isCustom) {
    return err;
  } else {
    throw err;
  }
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

// give roles booleans for ease
function getRolesAsBool(roles) {
  const rolesAsBool = {
    isSuperAdmin: false,
    isAdmin: false,
    isUser: false,
  };
  if (roles?.includes(SUPER_ADMIN)) {
    rolesAsBool.isSuperAdmin = true;
  } else if (roles?.includes(ADMIN)) {
    rolesAsBool.isAdmin = true;
  } else if (roles?.includes(USER)) {
    rolesAsBool.isUser = true;
  }

  return rolesAsBool;
}

// pagination helper for default attributes
function getPaginationAttributes(page = 0, limit = 10) {
  const offset = limit * page;

  return {
    limit,
    offset,
  };
}

module.exports = {
  throwCustomError,
  errorHandler,
  responseHandler,
  getRolesAsBool,
  getPaginationAttributes,
};
