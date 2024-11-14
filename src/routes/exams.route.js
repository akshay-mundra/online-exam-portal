const express = require('express');
const router = express.Router();

const authMiddlewares = require('../middlewares/auth.middleware');
const commonHelpers = require('../helpers/common.helper');
const examControllers = require('../controllers/exams.controller');
const examValidators = require('../validators/exams.validator');

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

router.get(
  '/:id/users',
  authMiddlewares.authenticate,
  authMiddlewares.authorize(['admin']),
  examControllers.getAllUsers,
  commonHelpers.responseHandler,
);

router.post(
  '/:id/users',
  authMiddlewares.authenticate,
  authMiddlewares.authorize(['admin']),
  examControllers.addUser,
  commonHelpers.responseHandler,
);

router.get(
  '/:id/users/:userId',
  authMiddlewares.authenticate,
  authMiddlewares.authorize(['admin', 'user']),
  examControllers.getUser,
  commonHelpers.responseHandler,
);

router.post(
  '/:id/questions',
  authMiddlewares.authenticate,
  authMiddlewares.authorize(['admin']),
  examValidators.createQuestion,
  examControllers.createQuestion,
  commonHelpers.responseHandler,
);

router.get(
  '/:id/questions',
  authMiddlewares.authenticate,
  authMiddlewares.authorize(['admin', 'user']),
  examControllers.getAllQuestions,
  commonHelpers.responseHandler,
);

router.get(
  '/:id/questions/:questionId',
  authMiddlewares.authenticate,
  authMiddlewares.authorize(['admin', 'user']),
  examControllers.getQuestion,
  commonHelpers.responseHandler,
);

module.exports = router;
