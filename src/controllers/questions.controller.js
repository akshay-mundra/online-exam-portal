const commonHelpers = require('../helpers/common.helper');
const questionServices = require('../services/questions.service');

async function bulkCreate(req, res, next) {
  try {
    const user = req.user;
    const { body: payload } = req;
    const result = await questionServices.bulkCreate(user, payload);
    res.data = result;
    res.statusCode = 201;
    next();
  } catch (err) {
    console.log(err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}

module.exports = { bulkCreate };
