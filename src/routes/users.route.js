const express = require('express');
const router = express.Router();

const authMiddlewares = require('../middlewares/auth.middleware');
const commonHelpers = require('../helpers/common.helper');
const userControllers = require('../controllers/users.controller');

router.get(
  '/',
  authMiddlewares.authenticate,
  authMiddlewares.authorize(['admin']),
  userControllers.getAll,
  commonHelpers.responseHandler,
);

router.get(
  '/:id',
  authMiddlewares.authenticate,
  authMiddlewares.authorize(['admin', 'user']),
  userControllers.get,
  commonHelpers.responseHandler,
);

router.put(
  '/:id',
  authMiddlewares.authenticate,
  authMiddlewares.authorize(['admin']),
  userControllers.update,
  commonHelpers.responseHandler,
);

router.delete(
  '/:id',
  authMiddlewares.authenticate,
  authMiddlewares.authorize(['admin']),
  userControllers.remove,
  commonHelpers.responseHandler,
);

module.exports = router;
