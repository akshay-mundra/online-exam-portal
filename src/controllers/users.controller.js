const commonHelpers = require('../helpers/common.helper');
const userServices = require('../services/users.service');
const { logger } = require('../helpers/loggers.helper');

async function getAll(req, res, next) {
  try {
    const { user, query } = req;
    const result = await userServices.getAll(user, query);
    res.data = result;
    res.statusCode = 200;
    next();
  } catch (error) {
    logger.error(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function getMe(req, res, next) {
  try {
    const user = req.user;
    const result = await userServices.getMe(user);
    res.data = result;
    res.statusCode = 200;
    next();
  } catch (error) {
    logger.error(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function get(req, res, next) {
  try {
    const { user, params } = req;
    const result = await userServices.get(user, params);
    res.data = result;
    res.statusCode = 200;
    next();
  } catch (error) {
    logger.error(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function update(req, res, next) {
  try {
    const { body: payload, user, params } = req;
    const result = await userServices.update(user, params, payload);
    res.data = result;
    res.statusCode = 202;
    next();
  } catch (error) {
    logger.error(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function remove(req, res, next) {
  try {
    const { user, params } = req;
    const result = await userServices.remove(user, params);
    res.data = result;
    res.statusCode = 204;
    next();
  } catch (error) {
    logger.error(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function bulkCreate(req, res, next) {
  try {
    const { body: payload, user } = req;
    const result = await userServices.bulkCreate(user, payload);
    res.data = result;
    res.statusCode = 201;
    next();
  } catch (error) {
    logger.error(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function getAllExams(req, res, next) {
  try {
    const { user, params } = req;
    const result = await userServices.getAllExams(user, params);
    res.data = result;
    res.statusCode = 200;
    next();
  } catch (error) {
    logger.error(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function startExam(req, res, next) {
  try {
    const { user, params } = req;
    const result = await userServices.startExam(user, params);
    res.data = result;
    res.statusCode = 200;
    next();
  } catch (error) {
    logger.error(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

module.exports = {
  getAll,
  getMe,
  get,
  update,
  remove,
  bulkCreate,
  getAllExams,
  startExam
};
