const express = require('express');
const router = express.Router();

const authMiddlewares = require('../middlewares/auth.middleware');
const commonHelpers = require('../helpers/common.helper');
const roleController = require('../controllers/roles.controller');
const roleValidators = require('../validators/roles.validator');

router.get(
  '/',
  authMiddlewares.authenticate,
  authMiddlewares.authorize(['super_admin']),
  roleController.getAll,
  commonHelpers.responseHandler,
);

router.post(
  '/',
  roleValidators.roleSchema,
  authMiddlewares.authenticate,
  authMiddlewares.authorize(['super_admin']),
  roleController.create,
  commonHelpers.responseHandler,
);

router.get(
  '/:id',
  authMiddlewares.authenticate,
  authMiddlewares.authorize(['super_admin']),
  roleController.get,
  commonHelpers.responseHandler,
);

router.patch(
  '/:id',
  roleValidators.roleSchema,
  authMiddlewares.authenticate,
  authMiddlewares.authorize(['super_admin']),
  roleController.update,
  commonHelpers.responseHandler,
);

router.delete(
  '/:id',
  authMiddlewares.authenticate,
  authMiddlewares.authorize(['super_admin']),
  roleController.remove,
  commonHelpers.responseHandler,
);

module.exports = router;
