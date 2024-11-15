const { Question, Option, Exam } = require('../models');
const commonHelpers = require('../helpers/common.helper');
const { sequelize } = require('../models');
const optionServices = require('../services/options.service');
const questionHelpers = require('../helpers/questions.helper');

async function bulkCreate(currentUser, payload) {
  const { questions, examId } = payload;

  const transactionContext = await sequelize.transaction();

  try {
    const exam = await Exam.findOne({ id: examId, admin_id: currentUser.id });
    if (!exam) {
      commonHelpers.throwCustomError(
        'You can only access exams created by you',
        403,
      );
    }

    const bulkQuestions = [];

    for (let question of questions) {
      const questionObj = {
        question: question.question,
        type: question.type,
        negative_marks: question.negativeMarks,
        exam_id: exam.id,
      };
      const options = question.options;

      const createdQuestion = await Question.create(questionObj, {
        transaction: transactionContext,
      });

      await Promise.all(
        options.map(option =>
          Option.create(
            {
              question_id: createdQuestion.id,
              option: option.option,
              is_correct: option.isCorrect,
              marks: option.marks,
            },
            {
              transaction: transactionContext,
            },
          ),
        ),
      );

      bulkQuestions.push(createdQuestion.id);
    }

    await transactionContext.commit();

    return bulkQuestions;
  } catch (err) {
    await transactionContext.rollback();
    throw err;
  }
}

async function createOption(currentUser, params, payload) {
  const { id } = params;
  const question = await Question.findOne({
    where: { id },
    include: [
      {
        model: Exam,
        as: 'exams',
        where: { admin_id: currentUser.id },
        attributes: ['id'],
      },
      {
        model: Option,
        where: { question_id: id },
        required: true,
      },
    ],
  });

  if (!question) {
    commonHelpers.throwCustomError(
      'question not found or you do not have access to it',
      403,
    );
  }

  if (
    payload.isCorrect &&
    question.type === 'single_choice' &&
    !questionHelpers.checkOptionsSingleChoice(question.Options)
  ) {
    commonHelpers.throwCustomError(
      'Single choice question can only have single option as correct',
      400,
    );
  }

  return await optionServices.create(id, payload);
}

module.exports = { bulkCreate, createOption };
