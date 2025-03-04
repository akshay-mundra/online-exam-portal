const commonHelpers = require('../helpers/common.helper');
const questionServices = require('../services/questions.service');
const { logger } = require('../helpers/loggers.helper');

async function bulkCreate(req, res, next) {
  try {
    const { body: payload, user } = req;
    const result = await questionServices.bulkCreate(user, payload);
    res.data = result;
    res.statusCode = 201;
    next();
  } catch (error) {
    logger.error(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function createOption(req, res, next) {
  try {
    const { body: payload, user, params } = req;
    const result = await questionServices.createOption(user, params, payload);
    res.data = result;
    res.statusCode = 201;
    next();
  } catch (error) {
    logger.error(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function getOption(req, res, next) {
  try {
    const { user, params } = req;
    const result = await questionServices.getOption(user, params);
    res.data = result;
    res.statusCode = 200;
    next();
  } catch (error) {
    logger.error(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function updateOption(req, res, next) {
  try {
    const { user, params, body: payload } = req;
    const result = await questionServices.updateOption(user, params, payload);
    res.data = result;
    res.statusCode = 202;
    next();
  } catch (error) {
    logger.error(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function removeOption(req, res, next) {
  try {
    const { user, params } = req;
    const result = await questionServices.removeOption(user, params);
    res.data = result;
    res.statusCode = 204;
    next();
  } catch (error) {
    logger.error(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

module.exports = {
  bulkCreate,
  createOption,
  getOption,
  updateOption,
  removeOption
};
