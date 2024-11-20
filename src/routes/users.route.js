const express = require('express');
const router = express.Router();

const authMiddlewares = require('../middlewares/auth.middleware');
const commonHelpers = require('../helpers/common.helper');
const userControllers = require('../controllers/users.controller');
const userValidators = require('../validators/users.validator');
const multerMiddlewares = require('../middlewares/multer.middleware');
const utilMiddlewares = require('../middlewares/utils.middleware');
const { ADMIN, USER } = require('../constants/common.constant').roles;
const userSerializers = require('../serializers/users.serializer');

router.get(
  '/',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  userControllers.getAll,
  userSerializers.users,
  commonHelpers.responseHandler,
);

router.post(
  '/bulk-create',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  multerMiddlewares.upload.single('file'),
  utilMiddlewares.convertUserFileToObject,
  userValidators.bulkCreateSchema,
  userControllers.bulkCreate,
  commonHelpers.responseHandler,
);

router.get(
  '/:id',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN, USER]),
  userControllers.get,
  userSerializers.users,
  commonHelpers.responseHandler,
);

router.put(
  '/:id',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  userValidators.updateSchema,
  userControllers.update,
  userSerializers.users,
  commonHelpers.responseHandler,
);

router.delete(
  '/:id',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  userControllers.remove,
  commonHelpers.responseHandler,
);

router.get(
  '/:id/exams',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([USER]),
  userControllers.getAllExams,
  commonHelpers.responseHandler,
);

module.exports = router;
