const commonHelpers = require('../helpers/common.helper');
const jwtHelpers = require('../helpers/jwt.helper');
const { SUPER_ADMIN, ADMIN, USER } = require('../constants/common.constant').roles;

async function authenticate(req, res, next) {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      commonHelpers.throwCustomError('Access Denied | Token Not Found', 401);
    }
    const decodedData = await jwtHelpers.verifyToken(token);
    req.user = decodedData;

    next();
  } catch (error) {
    console.log(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

function authorize(allowedRoles) {
  return (req, res, next) => {
    try {
      const userRoles = req.user?.roles;

      if (userRoles.includes(SUPER_ADMIN)) return next();

      if (userRoles && allowedRoles.some(role => userRoles.includes(role))) {
        return next();
      } else {
        commonHelpers.throwCustomError('Access Denied | Forbidden', 403);
      }
    } catch (error) {
      console.log(error);
      commonHelpers.errorHandler(req, res, error.message, error.statusCode);
    }
  };
}

async function authorizeRegister(req, res, next) {
  try {
    const { body: payload } = req;
    const { roles } = payload;

    if (!roles || roles.length === 0) commonHelpers.throwCustomError('roles are required', 400);

    if (roles.includes(SUPER_ADMIN)) {
      return commonHelpers.throwCustomError('Not allowed to create super_admin', 401);
    } else if (roles.includes(USER)) {
      await authenticate(req, res, () => {
        authorize([ADMIN])(req, res, next);
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

module.exports = { authenticate, authorize, authorizeRegister };
