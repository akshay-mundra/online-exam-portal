const express = require('express');
const router = express.Router();

const authMiddlewares = require('../middlewares/auth.middleware');
const commonHelpers = require('../helpers/common.helper');
const examControllers = require('../controllers/exams.controller');

router.get(
  '/',
  authMiddlewares.authenticate,
  authMiddlewares.authorize(['admin']),
  examControllers.getAll,
  commonHelpers.responseHandler,
);

router.post(
  '/',
  authMiddlewares.authenticate,
  authMiddlewares.authorize(['admin']),
  examControllers.create,
  commonHelpers.responseHandler,
);

router.get(
  '/:id',
  authMiddlewares.authenticate,
  authMiddlewares.authorize(['admin', 'user']),
  examControllers.get,
  commonHelpers.responseHandler,
);

router.put(
  '/:id',
  authMiddlewares.authenticate,
  authMiddlewares.authorize(['admin']),
  examControllers.update,
  commonHelpers.responseHandler,
);

router.delete(
  '/:id',
  authMiddlewares.authenticate,
  authMiddlewares.authorize(['admin']),
  examControllers.remove,
  commonHelpers.responseHandler,
);

module.exports = router;
