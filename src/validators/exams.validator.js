const Joi = require('joi');
const validateHelpers = require('../helpers/validators.helper');
const commonHelpers = require('../helpers/common.helper');

async function examSchema(req, res, next) {
  const schema = Joi.object({
    title: Joi.string().required(),
    startTime: Joi.date().timestamp().required(),
    endTime: Joi.date().timestamp().required()
  });

  try {
    validateHelpers.validateRequest(req, res, next, schema, 'body');
  } catch (error) {
    console.log('login schema', error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function createQuestionSchema(req, res, next) {
  const schema = Joi.object({
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

  try {
    validateHelpers.validateRequest(req, res, next, schema, 'body');
  } catch (error) {
    console.log('login schema', error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function udpateQuestionSchema(req, res, next) {
  const schema = Joi.object({
    question: Joi.string().min(3).required(),
    type: Joi.string().valid('single_choice', 'multi_choice').required(),
    negativeMarks: Joi.number()
  });

  try {
    validateHelpers.validateRequest(req, res, next, schema, 'body');
  } catch (error) {
    console.log('login schema', error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

async function addUserSchema(req, res, next) {
  const schema = Joi.object({
    userId: Joi.string().required()
  });

  try {
    validateHelpers.validateRequest(req, res, next, schema, 'body');
  } catch (error) {
    console.log('login schema', error);
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
}

module.exports = {
  examSchema,
  createQuestionSchema,
  udpateQuestionSchema,
  addUserSchema
};
