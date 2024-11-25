const express = require('express');
const router = express.Router();

const authMiddlewares = require('../middlewares/auth.middleware');
const commonHelpers = require('../helpers/common.helper');
const examControllers = require('../controllers/exams.controller');
const examValidators = require('../validators/exams.validator');
const { ADMIN, USER } = require('../constants/common.constant').roles;
const examSerializers = require('../serializers/exams.serializer');
const userExamSerializers = require('../serializers/users-exams.serializer');
const questionSerializers = require('../serializers/questions.serializer');

router.get(
  '/',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  examControllers.getAll,
  examSerializers.exams,
  commonHelpers.responseHandler
);

router.post(
  '/',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  examValidators.examSchema,
  examControllers.create,
  examSerializers.exams,
  commonHelpers.responseHandler
);

router.get(
  '/:id',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN, USER]),
  examControllers.get,
  examSerializers.exams,
  commonHelpers.responseHandler
);

router.put(
  '/:id',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  examValidators.examSchema,
  examControllers.update,
  examSerializers.exams,
  commonHelpers.responseHandler
);

router.delete(
  '/:id',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  examControllers.remove,
  commonHelpers.responseHandler
);

router.get(
  '/:id/result',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  examControllers.getResult,
  commonHelpers.responseHandler
);

router.get(
  '/:id/users',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  examControllers.getAllUsers,
  examSerializers.userWithExams,
  commonHelpers.responseHandler
);

router.post(
  '/:id/users',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  examValidators.addUserSchema,
  examControllers.addUser,
  userExamSerializers.usersExams,
  commonHelpers.responseHandler
);

router.get(
  '/:id/users/:userId',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN, USER]),
  examControllers.getUser,
  examSerializers.userWithExams,
  commonHelpers.responseHandler
);

router.delete(
  '/:id/users/:userId',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  examControllers.removeUser,
  commonHelpers.responseHandler
);

router.post(
  '/:id/questions',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  examValidators.createQuestionSchema,
  examControllers.createQuestion,
  questionSerializers.questions,
  commonHelpers.responseHandler
);

router.get(
  '/:id/questions',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN, USER]),
  examControllers.getAllQuestions,
  questionSerializers.questions,
  commonHelpers.responseHandler
);

router.get(
  '/:id/questions/:questionId',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN, USER]),
  examControllers.getQuestion,
  questionSerializers.questions,
  commonHelpers.responseHandler
);

router.put(
  '/:id/questions/:questionId',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  examValidators.udpateQuestionSchema,
  examControllers.updateQuestion,
  questionSerializers.questions,
  commonHelpers.responseHandler
);

router.delete(
  '/:id/questions/:questionId',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  examControllers.removeQuestion,
  commonHelpers.responseHandler
);

module.exports = router;
