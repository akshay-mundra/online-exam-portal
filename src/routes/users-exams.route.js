const express = require('express');
const router = express.Router();

const authMiddlewares = require('../middlewares/auth.middleware');
const commonHelpers = require('../helpers/common.helper');
const userExamControllers = require('../controllers/users-exams.controller');
const { USER } = require('../constants/common.constant').roles;

router.put(
  '/:id/answers',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([USER]),
  userExamControllers.createAnswer,
  commonHelpers.responseHandler
);

router.get(
  '/:id/result',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([USER]),
  userExamControllers.getUserScore,
  commonHelpers.responseHandler
);

router.post(
  '/:id/submit-exam',
  authMiddlewares.authenticate,
  authMiddlewares.authorize([USER]),
  userExamControllers.submitExam,
  commonHelpers.responseHandler
);

module.exports = router;
