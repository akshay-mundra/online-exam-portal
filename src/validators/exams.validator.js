const Joi = require('joi');
const validateHelpers = require('../helpers/validators.helper');
const commonHelpers = require('../helpers/common.helper');

async function createQuestion(req, res, next) {
  const schema = Joi.object({
    question: Joi.string().min(3).required(),
    type: Joi.string().valid('single_choice', 'multi_choice').required(),
    negativeMarks: Joi.number(),
    options: Joi.array().items(
      Joi.object({
        option: Joi.string().required(),
        isCorrect: Joi.boolean(),
        marks: Joi.number(),
      }),
    ),
  });

  try {
    validateHelpers.validateRequest(req, res, next, schema, 'body');
  } catch (err) {
    console.log('login schema', err);
    commonHelpers.errorHandler(req, res, err.message, err.statusCode);
  }
}

module.exports = { createQuestion };
