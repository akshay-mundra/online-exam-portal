const commonHelpers = require('../helpers/common.helper');
const roleServices = require('../services/roles.service');

async function create(req, res, next) {
  try {
    const { body: payload } = req;
    const result = await roleServices.create(payload);
    res.data = result;
    res.statusCode = 201;
    next();
  } catch (error) {
    console.log(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function getAll(req, res, next) {
  try {
    const result = await roleServices.getAll();
    res.data = result;
    res.statusCode = 200;
    next();
  } catch (error) {
    console.log(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function get(req, res, next) {
  try {
    const { id } = req.params;
    const result = await roleServices.get(id);
    res.data = result;
    res.statusCode = 200;
    next();
  } catch (error) {
    console.log(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function update(req, res, next) {
  try {
    const { body: payload } = req;
    const { id } = req.params;
    const result = await roleServices.update(id, payload);
    res.data = result;
    res.statusCode = 202;
    next();
  } catch (error) {
    console.log(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const result = await roleServices.remove(id);
    res.data = result;
    res.statusCode = 202;
    next();
  } catch (error) {
    console.log(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

module.exports = { create, update, get, getAll, remove };
