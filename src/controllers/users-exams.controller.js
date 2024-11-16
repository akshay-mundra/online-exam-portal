const commonHelpers = require('../helpers/common.helper');
const userExamServices = require('../services/users-exams.service');

async function createAnswer(req, res, next) {
  try {
    const { body: payload, params, user } = req;
    const result = await userExamServices.createAnswer(user, params, payload);
    res.data = result;
    res.statusCode = 201;
    next();
  } catch (err) {
    console.log(err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}
module.exports = { createAnswer };
