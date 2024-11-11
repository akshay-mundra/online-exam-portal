const commonHelpers = require('../helpers/common.helper');
const examServices = require('../services/exams.service');

async function getAll(req, res, next) {
  try {
    const user = req.user;
    const page = req?.query?.page;
    const result = await examServices.getAll(user, page);
    res.data = result;
    res.statusCode = 200;
    next();
  } catch (err) {
    console.log(err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}

async function create(req, res, next) {
  try {
    const user = req.user;
    const { body: payload } = req;
    const result = await examServices.create(user, payload);
    res.data = result;
    res.statusCode = 201;
    next();
  } catch (err) {
    console.log(err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}

async function get(req, res, next) {
  try {
    const user = req.user;
    const { id } = req.params;
    const result = await examServices.get(user, id);
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
    const user = req.user;
    const { id } = req.params;
    const { body: payload } = req;
    const result = await examServices.update(user, id, payload);
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
    const user = req.user;
    const { id } = req.params;
    const result = await examServices.remove(user, id);
    res.data = result;
    res.statusCode = 202;
    next();
  } catch (err) {
    console.log(err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}

module.exports = { getAll, create, get, update, remove };
