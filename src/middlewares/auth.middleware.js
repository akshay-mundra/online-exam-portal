const commonHelpers = require('../helpers/common.helper');
const jwtHelpers = require('../helpers/jwt.helper');
const { User } = require('../models');

async function authenticate(req, res, next) {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      commonHelpers.throwCustomError('Access Denied | Token Not Found', 401);
    }
    const decodedData = jwtHelpers.verifyToken(token);
    let user = await User.findOne({ where: { id: decodedData.id } });
    if (!user) {
      commonHelpers.throwCustomError('User not found', 403);
    }
    user.roles = decodedData.roles;
    req.user = user;

    next();
  } catch (err) {
    console.log(err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}

function authorize(allowedRoles) {
  return (req, res, next) => {
    try {
      const userRoles = req.user?.roles;

      if (userRoles.includes('super_admin')) return next();

      if (userRoles && allowedRoles.some(role => userRoles.includes(role))) {
        return next();
      } else {
        commonHelpers.throwCustomError('Access Denied | Forbidden', 403);
      }
    } catch (err) {
      console.log(err);
      commonHelpers.errorHandler(req, res, err.message, err.statusCode);
    }
  };
}

async function authorizeRegister(req, res, next) {
  try {
    const { body: payload } = req;
    const { roles } = payload;

    if (!roles || roles.length === 0)
      commonHelpers.throwCustomError('roles are required', 400);

    if (roles.includes('super_admin')) {
      return commonHelpers.throwCustomError(
        'Not allowed to create super_admin',
        401,
      );
    } else if (roles.includes('user')) {
      await authenticate(req, res, () => {
        authorize(['admin'])(req, res, next);
      });
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}

module.exports = { authenticate, authorize, authorizeRegister };
