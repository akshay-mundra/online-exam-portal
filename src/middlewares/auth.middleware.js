const commonHelpers = require('../helpers/common.helper');
const jwtHelpers = require('../helpers/jwt.helper');
const { SUPER_ADMIN, ADMIN } = require('../constants/common.constant').roles;
const { logger } = require('../helpers/loggers.helper');

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
    // handle jose token expired error
    if (error.code === 'ERR_JWT_EXPIRED' || error.message.includes('exp')) {
      error.message = 'Token expired';
      error.statusCode = 401;
    }
    logger.error(error);
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
      logger.error(error);
      commonHelpers.errorHandler(req, res, error.message, error.statusCode);
    }
  };
}

async function authorizeRegister(req, res, next) {
  try {
    const { body: payload } = req;
    let { roles } = payload;

    if (!roles || roles.length === 0) {
      roles = [ADMIN];
      req.body.roles = roles;
    }

    const { isSuperAdmin, isUser } = commonHelpers.getRolesAsBool(roles);

    if (isSuperAdmin) {
      return commonHelpers.throwCustomError('Not allowed to create super_admin', 401);
    } else if (isUser) {
      return await authenticate(req, res, () => {
        authorize([ADMIN])(req, res, next);
      });
    } else {
      next();
    }
  } catch (error) {
    logger.error(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

module.exports = { authenticate, authorize, authorizeRegister };
