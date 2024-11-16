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

async function addUser(req, res, next) {
  try {
    const user = req.user;
    const { id } = req.params;
    const { body: payload } = req;
    const result = await examServices.addUser(user, id, payload);
    res.data = result;
    res.statusCode = 201;
    next();
  } catch (err) {
    console.log(err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}

async function getAllUsers(req, res, next) {
  try {
    const user = req.user;
    const { id } = req.params;
    const { query } = req;
    const result = await examServices.getAllUsers(user, id, query);
    res.data = result;
    res.statusCode = 200;
    next();
  } catch (err) {
    console.log(err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}

async function getUser(req, res, next) {
  try {
    const user = req.user;
    const { id, userId } = req.params;
    const result = await examServices.getUser(user, userId, id);
    res.data = result;
    res.statusCode = 200;
    next();
  } catch (err) {
    console.log(err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}

async function removeUser(req, res, next) {
  try {
    const user = req.user;
    const { id, userId } = req.params;
    const result = await examServices.removeUser(user, userId, id);
    res.data = result;
    res.statusCode = 202;
    next();
  } catch (err) {
    console.log(err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}

async function createQuestion(req, res, next) {
  try {
    const user = req.user;
    const { id } = req.params;
    const { body: payload } = req;
    const result = await examServices.createQuestion(user, id, payload);
    res.data = result;
    res.statusCode = 201;
    next();
  } catch (err) {
    console.log(err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}

async function getAllQuestions(req, res, next) {
  try {
    const user = req.user;
    const { id } = req.params;
    const { query } = req;
    const result = await examServices.getAllQuestions(user, id, query);
    res.data = result;
    res.statusCode = 200;
    next();
  } catch (err) {
    console.log(err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}

async function getQuestion(req, res, next) {
  try {
    const user = req.user;
    const { id, questionId } = req.params;
    const result = await examServices.getQuestion(user, id, questionId);
    res.data = result;
    res.statusCode = 200;
    next();
  } catch (err) {
    console.log(err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}

async function updateQuestion(req, res, next) {
  try {
    const { user, params, body: payload } = req;
    const { id, questionId } = params;
    const result = await examServices.updateQuestion(
      user,
      id,
      questionId,
      payload,
    );
    res.data = result;
    res.statusCode = 202;
    next();
  } catch (err) {
    console.log(err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}

async function removeQuestion(req, res, next) {
  try {
    const { user, params } = req;
    const { id, questionId } = params;
    const result = await examServices.removeQuestion(user, id, questionId);
    res.data = result;
    res.statusCode = 202;
    next();
  } catch (err) {
    console.log(err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}

module.exports = {
  getAll,
  create,
  get,
  update,
  remove,
  getAllUsers,
  addUser,
  getUser,
  removeUser,
  createQuestion,
  getAllQuestions,
  getQuestion,
  updateQuestion,
  removeQuestion,
};
