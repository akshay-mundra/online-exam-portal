const { Question, Option, Exam } = require('../models');
const commonHelpers = require('../helpers/common.helper');
const { sequelize } = require('../models');
const optionServices = require('../services/options.service');
const questionHelpers = require('../helpers/questions.helper');

// bulk create questions from the csv or excel file
async function bulkCreate(currentUser, payload) {
  const { questions, examId } = payload;

  const transactionContext = await sequelize.transaction();

  try {
    const exam = await Exam.findOne({ id: examId, admin_id: currentUser.id });
    if (!exam) {
      commonHelpers.throwCustomError('You can only access exams created by you', 403);
    }

    const bulkQuestions = [];

    for (const question of questions) {
      const questionObj = {
        question: question.question,
        type: question.type,
        negative_marks: question.negativeMarks,
        exam_id: exam.id
      };
      const options = question.options;

      const createdQuestion = await Question.create(questionObj, {
        transaction: transactionContext
      });

      await Promise.all(
        options.map(option =>
          Option.create(
            {
              question_id: createdQuestion.id,
              option: option.option,
              is_correct: option.isCorrect,
              marks: option.marks
            },
            {
              transaction: transactionContext
            }
          )
        )
      );

      bulkQuestions.push(createdQuestion.id);
    }

    await transactionContext.commit();

    return bulkQuestions;
  } catch (error) {
    await transactionContext.rollback();
    throw error;
  }
}

// create single option for that question (users option service)
async function createOption(currentUser, params, payload) {
  const { id } = params;

  const question = await questionHelpers.getQuestionExamOptions(id, currentUser.id);

  if (!question) {
    commonHelpers.throwCustomError('question not found or you do not have access to it', 403);
  }

  if (
    payload.isCorrect &&
    question.type === 'single_choice' &&
    !questionHelpers.checkOptionsSingleChoice(question.Options)
  ) {
    commonHelpers.throwCustomError('Single choice question can only have single option as correct', 400);
  }

  return await optionServices.create(id, payload);
}

// get a option for that question
async function getOption(currentUser, params) {
  const { id, optionId } = params;

  const question = await questionHelpers.getQuestionExamOptions(id, currentUser.id, { id: optionId });

  if (!question) {
    commonHelpers.throwCustomError('question not found or you do not have access to it', 403);
  }

  return question.Options.pop();
}

// update the option
async function updateOption(currentUser, params, payload) {
  const { id, optionId } = params;

  const question = await questionHelpers.getQuestionExamOptions(id, currentUser.id, { id: optionId });

  if (!question) {
    commonHelpers.throwCustomError('question or option not found or you do not have access to it', 403);
  }

  if (
    payload.isCorrect &&
    question.type === 'single_choice' &&
    questionHelpers.checkOptionsSingleChoice(question.Options) > 1
  ) {
    commonHelpers.throwCustomError('Single choice question can only have single option as correct', 400);
  }

  return await optionServices.update(optionId, payload);
}

// remove the option from that question
async function removeOption(currentUser, params) {
  const { id, optionId } = params;

  const question = await questionHelpers.getQuestionExamOptions(id, currentUser.id, { id: optionId });

  if (!question) {
    commonHelpers.throwCustomError('question or option not found or you do not have access to it', 403);
  }

  return await optionServices.remove(optionId);
}

module.exports = {
  bulkCreate,
  createOption,
  getOption,
  updateOption,
  removeOption
};
