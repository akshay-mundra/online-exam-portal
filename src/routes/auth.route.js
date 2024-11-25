const express = require('express');
const router = express.Router();

const commonHelpers = require('../helpers/common.helper');
const authMiddlewares = require('../middlewares/auth.middleware');
const authControllers = require('../controllers/auth.controller');
const authValidators = require('../validators/auth.validator');

router.post('/login', authValidators.login, authControllers.login, commonHelpers.responseHandler);

router.post(
  '/register',
  authValidators.register,
  authMiddlewares.authorizeRegister,
  authControllers.register,
  commonHelpers.responseHandler
);

router.post(
  '/forgot-password',
  authValidators.forgotPassword,
  authControllers.forgotPassword,
  commonHelpers.responseHandler
);

router.post(
  '/reset-password',
  authValidators.resetPassword,
  authControllers.resetPassword,
  commonHelpers.responseHandler
);

router.delete('/logout', authMiddlewares.authenticate, authControllers.logout, commonHelpers.responseHandler);
module.exports = router;
