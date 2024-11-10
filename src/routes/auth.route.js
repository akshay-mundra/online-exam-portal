const express = require('express');
const router = express.Router();

const commonHelpers = require('../helpers/common.helper');
const authMiddlewares = require('../middlewares/auth.middleware');
const authControllers = require('../controllers/auth.controller');

router.post('/login', authControllers.login, commonHelpers.responseHandler);

router.post(
  '/register',
  authMiddlewares.authorizeRegister,
  authControllers.register,
  commonHelpers.responseHandler,
);

router.post(
  '/forgot-password',
  authControllers.forgotPassword,
  commonHelpers.responseHandler,
);

router.post(
  '/reset-password',
  authMiddlewares.authenticate,
  authControllers.resetPassword,
  commonHelpers.responseHandler,
);

router.get(
  '/logout',
  authMiddlewares.authenticate,
  authControllers.logout,
  commonHelpers.responseHandler,
);
module.exports = router;
