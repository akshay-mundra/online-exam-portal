const commonHelpers = require('../helpers/common.helper');
const userServices = require('../services/users.service');

async function getAll(req, res, next) {
  try {
    const user = req.user;
    const page = req?.query?.page;
    const result = await userServices.getAll(user, page);
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
    const { body: payload } = req;
    const { id } = req.params;
    const user = req.user;
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

module.exports = { getAll, get, update, remove };
