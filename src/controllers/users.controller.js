const commonHelpers = require('../helpers/common.helper');
const userServices = require('../services/users.service');

async function getAll(req, res, next) {
  try {
    const { user, query } = req;
    const result = await userServices.getAll(user, query);
    res.data = result;
    res.statusCode = 200;
    next();
  } catch (err) {
    console.log(err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}

async function get(req, res, next) {
  try {
    const { id } = req.params;
    const user = req.user;
    const result = await userServices.get(user, id);
    res.data = result;
    res.statusCode = 200;
    next();
  } catch (err) {
    console.log(err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}

async function update(req, res, next) {
  try {
    const { body: payload, user } = req;
    const { id } = req.params;
    const result = await userServices.update(user, id, payload);
    res.data = result;
    res.statusCode = 202;
    next();
  } catch (err) {
    console.log(err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const user = req.user;
    const result = await userServices.remove(user, id);
    res.data = result;
    res.statusCode = 202;
    next();
  } catch (err) {
    console.log(err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}

async function bulkCreate(req, res, next) {
  try {
    const { body: payload, user } = req;
    const result = await userServices.bulkCreate(user, payload);
    res.data = result;
    res.statusCode = 201;
    next();
  } catch (err) {
    console.log(err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}

async function getAllExams(req, res, next) {
  try {
    const { user, params } = req;
    const result = await userServices.getAllExams(user, params);
    res.data = result;
    res.statusCode = 200;
    next();
  } catch (err) {
    console.log(err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}

async function startExam(req, res, next) {
  try {
    const { user, params } = req;
    const result = await userServices.startExam(user, params);
    res.data = result;
    res.statusCode = 200;
    next();
  } catch (err) {
    console.log(err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}

module.exports = {
  getAll,
  get,
  update,
  remove,
  bulkCreate,
  getAllExams,
  startExam,
};
