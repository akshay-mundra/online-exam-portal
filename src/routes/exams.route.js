const express = require('express');
const router = express.Router();

const authMiddlewares = require('../middlewares/auth.middleware');
const commonHelpers = require('../helpers/common.helper');
const examControllers = require('../controllers/exams.controller');
const examValidators = require('../validators/exams.validator');
const { ADMIN, USER } = require('../constants/common.constant').roles;

router.get(
  '/',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  examControllers.getAll,
  commonHelpers.responseHandler,
);

router.post(
  '/',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  examValidators.examSchema,
  examControllers.create,
  commonHelpers.responseHandler,
);

router.get(
  '/:id',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN, USER]),
  examControllers.get,
  commonHelpers.responseHandler,
);

router.put(
  '/:id',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  examValidators.examSchema,
  examControllers.update,
  commonHelpers.responseHandler,
);

router.delete(
  '/:id',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  examControllers.remove,
  commonHelpers.responseHandler,
);

router.patch(
  '/:id/start-exam',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([USER]),
  examControllers.userStartExam,
  commonHelpers.responseHandler,
);

router.get(
  '/:id/result',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  examControllers.getResult,
  commonHelpers.responseHandler,
);

router.get(
  '/:id/users',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  examControllers.getAllUsers,
  commonHelpers.responseHandler,
);

router.post(
  '/:id/users',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  examValidators.addUserSchema,
  examControllers.addUser,
  commonHelpers.responseHandler,
);

router.get(
  '/:id/users/:userId',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN, USER]),
  examControllers.getUser,
  commonHelpers.responseHandler,
);

router.delete(
  '/:id/users/:userId',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  examControllers.removeUser,
  commonHelpers.responseHandler,
);

router.post(
  '/:id/questions',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  examValidators.createQuestionSchema,
  examControllers.createQuestion,
  commonHelpers.responseHandler,
);

router.get(
  '/:id/questions',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN, USER]),
  examControllers.getAllQuestions,
  commonHelpers.responseHandler,
);

router.get(
  '/:id/questions/:questionId',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN, USER]),
  examControllers.getQuestion,
  commonHelpers.responseHandler,
);

router.put(
  '/:id/questions/:questionId',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  examValidators.udpateQuestionSchema,
  examControllers.updateQuestion,
  commonHelpers.responseHandler,
);

router.delete(
  '/:id/questions/:questionId',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  examControllers.removeQuestion,
  commonHelpers.responseHandler,
);

module.exports = router;
