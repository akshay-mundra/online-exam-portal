const commonHelpers = require('../helpers/common.helper');
const authServices = require('../services/auth.service');

async function login(req, res, next) {
  try {
    const { body: payload } = req;
    const result = await authServices.login(payload);
    res.data = result;
    res.statusCode = 200;
    next();
  } catch (err) {
    console.log(err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}

async function register(req, res, next) {
  try {
    const { body: payload } = req;
    const result = await authServices.register(req, payload);
    res.data = result;
    res.statusCode = 201;
    next();
  } catch (err) {
    console.log(err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { body: payload } = req;
    const result = await authServices.forgotPassword(payload);
    res.data = result;
    res.statusCode = 200;
    next();
  } catch (err) {
    console.log(err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { body: payload } = req;
    const { id } = req.user;
    const result = await authServices.resetPassword(id, payload);
    res.data = result;
    res.statusCode = 202;
    next();
  } catch (err) {
    console.log(err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}

module.exports = { register, login, forgotPassword, resetPassword };
