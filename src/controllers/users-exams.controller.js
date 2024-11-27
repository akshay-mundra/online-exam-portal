const commonHelpers = require('../helpers/common.helper');
const userExamServices = require('../services/users-exams.service');
const { logger } = require('../helpers/loggers.helper');

async function createAnswer(req, res, next) {
  try {
    const { body: payload, params, user } = req;
    const result = await userExamServices.createAnswer(user, params, payload);
    res.data = result;
    res.statusCode = 201;
    next();
  } catch (error) {
    logger.error(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function getUserScore(req, res, next) {
  try {
    const { params, user } = req;
    const result = await userExamServices.getUserScore(user, params);
    res.data = result;
    res.statusCode = 200;
    next();
  } catch (error) {
    logger.error(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function submitExam(req, res, next) {
  try {
    const { params, user } = req;
    const result = await userExamServices.submitExam(user, params);
    res.data = result;
    res.statusCode = 202;
    next();
  } catch (error) {
    logger.error(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

module.exports = { createAnswer, getUserScore, submitExam };
