const commonHelpers = require('../helpers/common.helper');
const userExamServices = require('../services/users-exams.service');

async function createAnswer(req, res, next) {
  try {
    const { body: payload, params, user } = req;
    const result = await userExamServices.createAnswer(user, params, payload);
    res.data = result;
    res.statusCode = 201;
    next();
  } catch (error) {
    console.log(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function calculateUserScore(req, res, next) {
  try {
    const { params, user } = req;
    const result = await userExamServices.calculateUserScore(user, params);
    res.data = result;
    res.statusCode = 200;
    next();
  } catch (error) {
    console.log(error);
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
    console.log(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

module.exports = { createAnswer, calculateUserScore, submitExam };
