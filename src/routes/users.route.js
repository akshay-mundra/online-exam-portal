const express = require('express');
const router = express.Router();

const authMiddlewares = require('../middlewares/auth.middleware');
const commonHelpers = require('../helpers/common.helper');
const userControllers = require('../controllers/users.controller');
const userValidators = require('../validators/users.validator');
const multerMiddlewares = require('../middlewares/multer.middleware');
const utilMiddlewares = require('../middlewares/utils.middleware');

router.get(
  '/',
  authMiddlewares.authenticate,
  authMiddlewares.authorize(['admin']),
  userControllers.getAll,
  commonHelpers.responseHandler,
);

router.post(
  '/bulk-create',
  authMiddlewares.authenticate,
  authMiddlewares.authorize(['admin']),
  multerMiddlewares.upload.single('file'),
  utilMiddlewares.convertUserFileToObject,
  userValidators.bulkCreateSchema,
  userControllers.bulkCreate,
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
  userValidators.updateSchema,
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

router.get(
  '/:id/exams',
  authMiddlewares.authenticate,
  authMiddlewares.authorize(['user']),
  userControllers.getAllExams,
  commonHelpers.responseHandler,
);

module.exports = router;
