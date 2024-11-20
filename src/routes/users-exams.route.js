const express = require('express');
const router = express.Router();

const authMiddlewares = require('../middlewares/auth.middleware');
const commonHelpers = require('../helpers/common.helper');
const userExamControllers = require('../controllers/users-exams.controller');

router.put(
  '/:id/answers',
  authMiddlewares.authenticate,
  authMiddlewares.authorize(['user']),
  userExamControllers.createAnswer,
  commonHelpers.responseHandler,
);

router.get(
  '/:id/result',
  authMiddlewares.authenticate,
  authMiddlewares.authorize(['user']),
  userExamControllers.calculateUserScore,
  commonHelpers.responseHandler,
);

router.patch(
  '/:id/submit-exam',
  authMiddlewares.authenticate,
  authMiddlewares.authorize(['user']),
  userExamControllers.submitExam,
  commonHelpers.responseHandler,
);

module.exports = router;
