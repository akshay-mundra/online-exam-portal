const express = require('express');
const router = express.Router();

const authMiddlewares = require('../middlewares/auth.middleware');
const commonHelpers = require('../helpers/common.helper');
const userExamControllers = require('../controllers/users-exams.controller');
const { ADMIN } = require('../constants/common.constant').roles;

router.put(
  '/:id/answers',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  userExamControllers.createAnswer,
  commonHelpers.responseHandler
);

router.get(
  '/:id/result',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  userExamControllers.calculateUserScore,
  commonHelpers.responseHandler
);

router.post(
  '/:id/submit-exam',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([ADMIN]),
  userExamControllers.submitExam,
  commonHelpers.responseHandler
);

module.exports = router;
