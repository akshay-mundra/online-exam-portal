const commonHelpers = require('../helpers/common.helper');
const examServices = require('../services/exams.service');

async function getAll(req, res, next) {
  try {
    const { user, query } = req;
    const result = await examServices.getAll(user, query);
    res.data = result;
    res.statusCode = 200;
    next();
  } catch (error) {
    console.log(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function create(req, res, next) {
  try {
    const { user, body: payload } = req;
    const result = await examServices.create(user, payload);
    res.data = result;
    res.statusCode = 201;
    next();
  } catch (error) {
    console.log(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function get(req, res, next) {
  try {
    const { user, params } = req;
    const result = await examServices.get(user, params);
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
    const { body: payload, user, params } = req;
    const result = await examServices.update(user, params, payload);
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
    const { user, params } = req;
    const result = await examServices.remove(user, params);
    res.data = result;
    res.statusCode = 202;
    next();
  } catch (error) {
    console.log(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function getResult(req, res, next) {
  try {
    const { user, params } = req;
    const result = await examServices.getResult(user, params);
    res.data = result;
    res.statusCode = 200;
    next();
  } catch (error) {
    console.log(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function addUser(req, res, next) {
  try {
    const { body: payload, user, params } = req;
    const result = await examServices.addUser(user, params, payload);
    res.data = result;
    res.statusCode = 201;
    next();
  } catch (error) {
    console.log(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function getAllUsers(req, res, next) {
  try {
    const { query, user, params } = req;
    const result = await examServices.getAllUsers(user, params, query);
    res.data = result;
    res.statusCode = 200;
    next();
  } catch (error) {
    console.log(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function getUser(req, res, next) {
  try {
    const { user, params } = req;
    const result = await examServices.getUser(user, params);
    res.data = result;
    res.statusCode = 200;
    next();
  } catch (error) {
    console.log(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function removeUser(req, res, next) {
  try {
    const { user, params } = req;
    const result = await examServices.removeUser(user, params);
    res.data = result;
    res.statusCode = 202;
    next();
  } catch (error) {
    console.log(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function createQuestion(req, res, next) {
  try {
    const { body: payload, user, params } = req;
    const result = await examServices.createQuestion(user, params, payload);
    res.data = result;
    res.statusCode = 201;
    next();
  } catch (error) {
    console.log(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function getAllQuestions(req, res, next) {
  try {
    const { query, user, params } = req;
    const result = await examServices.getAllQuestions(user, params, query);
    res.data = result;
    res.statusCode = 200;
    next();
  } catch (error) {
    console.log(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function getQuestion(req, res, next) {
  try {
    const { user, params } = req;
    const result = await examServices.getQuestion(user, params);
    res.data = result;
    res.statusCode = 200;
    next();
  } catch (error) {
    console.log(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function updateQuestion(req, res, next) {
  try {
    const { user, params, body: payload } = req;
    const result = await examServices.updateQuestion(user, params, payload);
    res.data = result;
    res.statusCode = 202;
    next();
  } catch (error) {
    console.log(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function removeQuestion(req, res, next) {
  try {
    const { user, params } = req;
    const result = await examServices.removeQuestion(user, params);
    res.data = result;
    res.statusCode = 202;
    next();
  } catch (error) {
    console.log(error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

module.exports = {
  getAll,
  create,
  get,
  update,
  remove,
  getResult,
  getAllUsers,
  addUser,
  getUser,
  removeUser,
  createQuestion,
  getAllQuestions,
  getQuestion,
  updateQuestion,
  removeQuestion
};
