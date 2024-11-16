const express = require('express');
const router = express.Router();

const authMiddlewares = require('../middlewares/auth.middleware');
const commonHelpers = require('../helpers/common.helper');
const userExamServices = require('../controllers/users-exams.controller');

router.put(
  '/:id/answers',
  authMiddlewares.authenticate,
  authMiddlewares.authorize(['user']),
  userExamServices.createAnswer,
  commonHelpers.responseHandler,
);

module.exports = router;
