const express = require('express');
const router = express.Router();

const authMiddlewares = require('../middlewares/auth.middleware');
const commonHelpers = require('../helpers/common.helper');
const questionValidators = require('../validators/questions.validator');
const optionValidators = require('../validators/options.validator');
const multerMiddlewares = require('../middlewares/multer.middleware');
const utilMiddlewares = require('../middlewares/utils.middleware');
const questionControllers = require('../controllers/questions.controller');

router.post(
  '/bulk-create',
  authMiddlewares.authenticate,
  authMiddlewares.authorize(['admin']),
  multerMiddlewares.upload.single('file'),
  utilMiddlewares.convertQuestionFileToObject,
  questionValidators.bulkCreateSchema,
  questionControllers.bulkCreate,
  commonHelpers.responseHandler,
);

router.post(
  '/:id/options',
  authMiddlewares.authenticate,
  authMiddlewares.authorize(['admin']),
  optionValidators.createSchema,
  questionControllers.createOption,
  commonHelpers.responseHandler,
);

module.exports = router;
