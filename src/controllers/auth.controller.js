const commonHelpers = require('../helpers/common.helper');
const authServices = require('../services/auth.service');

async function login(req, res, next) {
  try {
    const { body: payload } = req;
    const result = await authServices.login(payload);
    res.data = result;
    res.statusCode = 200;
    next();
  } catch (error) {
    console.log(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function register(req, res, next) {
  try {
    const { body: payload, user } = req;
    const result = await authServices.register(user, payload);
    res.data = result;
    res.statusCode = 201;
    next();
  } catch (error) {
    console.log(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { body: payload } = req;
    const result = await authServices.forgotPassword(payload);
    res.data = result;
    res.statusCode = 200;
    next();
  } catch (error) {
    console.log(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { body: payload } = req;
    const result = await authServices.resetPassword(payload);
    res.data = result;
    res.statusCode = 202;
    next();
  } catch (error) {
    console.log(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function logout(req, res, next) {
  try {
    const result = await authServices.logout();
    res.data = result;
    res.statusCode = 200;
    next();
  } catch (error) {
    console.log(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

module.exports = { register, login, forgotPassword, resetPassword, logout };
