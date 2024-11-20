const express = require('express');
const router = express.Router();

const authMiddlewares = require('../middlewares/auth.middleware');
const commonHelpers = require('../helpers/common.helper');
const questionValidators = require('../validators/questions.validator');
const optionValidators = require('../validators/options.validator');
const multerMiddlewares = require('../middlewares/multer.middleware');
const utilMiddlewares = require('../middlewares/utils.middleware');
const questionControllers = require('../controllers/questions.controller');
const { ADMIN } = require('../constants/common.constant').roles;

router.post(
  '/bulk-create',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  multerMiddlewares.upload.single('file'),
  utilMiddlewares.convertQuestionFileToObject,
  questionValidators.bulkCreateSchema,
  questionControllers.bulkCreate,
  commonHelpers.responseHandler,
);

router.post(
  '/:id/options',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  optionValidators.createSchema,
  questionControllers.createOption,
  commonHelpers.responseHandler,
);

router.get(
  '/:id/options/:optionId',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  questionControllers.getOption,
  commonHelpers.responseHandler,
);

router.put(
  '/:id/options/:optionId',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  optionValidators.createSchema,
  questionControllers.updateOption,
  commonHelpers.responseHandler,
);

router.delete(
  '/:id/options/:optionId',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  questionControllers.removeOption,
  commonHelpers.responseHandler,
);

module.exports = router;
