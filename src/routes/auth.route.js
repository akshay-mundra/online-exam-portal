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

// router.post('/logout', authControllers.logout);

// router.post('/forgot-password', authControllers.forgotPassword);

// router.post('/reset-password', authControllers.forgotPassword);

module.exports = router;
