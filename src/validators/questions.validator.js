const Joi = require('joi');
const validateHelpers = require('../helpers/validators.helper');
const commonHelpers = require('../helpers/common.helper');

async function bulkCreateSchema(req, res, next) {
  const questionObj = Joi.object({
    question: Joi.string().min(3).required(),
    type: Joi.string().valid('single_choice', 'multi_choice').required(),
    negativeMarks: Joi.number(),
    options: Joi.array().items(
      Joi.object({
        option: Joi.string().required(),
        isCorrect: Joi.boolean(),
        marks: Joi.number()
      })
    )
  });

  const schema = Joi.object({
    examId: Joi.string().required(),
    questions: Joi.array().items(questionObj)
  });

  try {
    validateHelpers.validateRequest(req, res, next, schema, 'body');
  } catch (error) {
    console.log('bulk create schema', error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

module.exports = { bulkCreateSchema };
