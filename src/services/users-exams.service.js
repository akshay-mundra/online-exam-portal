const {
  UserExam,
  Exam,
  Option,
  Question,
  Answer,
  sequelize,
} = require('../models');
const commonHelpers = require('../helpers/common.helper');
const moment = require('moment');
const { Op } = require('sequelize');

async function createAnswer(currentUser, params, payload) {
  const { id } = params;
  const { questionId, optionIds } = payload;

  const transactionContext = await sequelize.transaction();

  try {
    const userExam = await UserExam.findOne({
      where: { id },
    });

    if (!userExam) {
      commonHelpers.throwCustomError('Not found', 404);
    }

    if (userExam.user_id !== currentUser.id) {
      commonHelpers.throwCustomError('User not match', 403);
    }

    if (userExam.status === 'completed') {
      commonHelpers.throwCustomError('Already submited exam', 403);
    }

    const question = await Question.findOne({
      where: { id: questionId, exam_id: userExam.exam_id },
      include: [
        {
          model: Exam,
          as: 'exams',
        },
        {
          model: Option,
          required: true,
          attributes: ['id'],
          where: {
            id: {
              [Op.in]: optionIds,
            },
          },
        },
      ],
    });

    if (!question) {
      commonHelpers.throwCustomError('Question not found', 404);
    }

    const currentTime = moment();

    const isExamAvailable =
      currentTime.isAfter(question.exams.start_time) &&
      currentTime.isBefore(question.exams.end_time);

    if (!isExamAvailable) {
      commonHelpers.throwCustomError(
        'You can only submit answers within the allowed time window',
        403,
      );
    }

    const answers = question.Options.map(item => {
      return {
        option_id: item.id,
        question_id: questionId,
        user_exam_id: id,
      };
    });

    const createdAnswers = await Answer.bulkCreate(answers, {
      transaction: transactionContext,
      returning: true,
    });

    await transactionContext.commit();

    return createdAnswers;
  } catch (err) {
    await transactionContext.rollback();
    throw err;
  }
}

module.exports = { createAnswer };
