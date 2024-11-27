const { UserExam, Exam, Option, Question, Answer, sequelize } = require('../models');
const commonHelpers = require('../helpers/common.helper');
const userExamHelpers = require('../helpers/users-exams.helper');
const moment = require('moment');
const { Op } = require('sequelize');

// user submit answer - the submission contains the options selected by the user
// update create or delte the responses according to the user selection.
async function createAnswer(currentUser, params, payload) {
  const { id } = params;
  const { questionId, optionIds } = payload;

  const transactionContext = await sequelize.transaction();

  try {
    const userExam = await UserExam.findOne({
      where: { id }
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
          as: 'exams'
        },
        {
          model: Option,
          required: true,
          attributes: ['id'],
          where: {
            id: {
              [Op.in]: optionIds
            }
          }
        }
      ]
    });

    if (!question) {
      commonHelpers.throwCustomError('Question not found', 404);
    }

    if (question.type === 'single_choice' && optionIds.length > 1) {
      commonHelpers.throwCustomError('Cannot select multiple options for the single choice type question', 400);
    }

    const currentTime = moment();

    const isExamAvailable =
      currentTime.isAfter(question.exams.start_time) && currentTime.isBefore(question.exams.end_time);

    if (!isExamAvailable) {
      commonHelpers.throwCustomError('You can only submit answers within the allowed time window', 403);
    }

    const validOptionIds = question.Options?.map(option => option.id);

    // find the prev selected options and
    // if any of the optoins is not present in current selection then delete it
    // and if present then do nothing and if new option then create it
    const prevAns = await Answer.findAll({
      where: { user_exam_id: id, question_id: questionId },
      attributes: ['id', 'option_id']
    });

    const prevAnswerIds = prevAns.map(ans => ans.option_id);

    const ansToCreate = question.Options.reduce((acc, option) => {
      if (!prevAnswerIds.includes(option.id)) {
        acc?.push({
          option_id: option.id,
          question_id: questionId,
          user_exam_id: id
        });
      }
      return acc;
    }, []);

    const ansToDelete = prevAns.reduce((acc, currentAns) => {
      if (!validOptionIds.includes(currentAns.option_id)) {
        acc.push(currentAns.id);
      }
      return acc;
    }, []);

    if (ansToDelete && ansToDelete.length > 0) {
      await Answer.destroy(
        {
          where: {
            id: {
              [Op.in]: ansToDelete
            }
          }
        },
        {
          transaction: transactionContext
        }
      );
    }

    if (ansToCreate && ansToCreate.length > 0) {
      await Answer.bulkCreate(ansToCreate, {
        transaction: transactionContext
      });
    }

    await transactionContext.commit();

    return 'Answer submitted successfully';
  } catch (error) {
    await transactionContext.rollback();
    throw error;
  }
}

// get user score for the user exam.
async function getUserScore(currentUser, params) {
  const { id } = params;
  const roles = currentUser.roles;
  const { isUser } = commonHelpers.getRolesAsBool(roles);

  const userExam = await UserExam.findOne({
    where: { id: id }
  });

  if (!userExam) {
    commonHelpers.throwCustomError('User Exam not found', 404);
  }

  if (isUser && userExam.user_id !== currentUser.id) {
    commonHelpers.throwCustomError('Can not see result of other user', 403);
  }

  if (['on-going', 'pending'].includes(userExam.status)) {
    commonHelpers.throwCustomError('User has not completed the exam', 400);
  }

  return userExam.score;
}

// submit exam - change the exam status for the user
async function submitExam(currentUser, params) {
  const { id } = params;

  const userExam = await UserExam.findByPk(id);

  if (!userExam) {
    commonHelpers.throwCustomError('user exam not found', 404);
  }

  if (userExam.user_id !== currentUser.id) {
    commonHelpers.throwCustomError('Can not access other user', 403);
  }

  if (userExam.status === 'completed') {
    commonHelpers.throwCustomError('Exam is already submitted', 400);
  }

  const exam = await Exam.findByPk(userExam.exam_id);

  if (!exam) {
    commonHelpers.throwCustomError('Exam not found', 404);
  }

  const currentTime = moment();

  if (!currentTime.isAfter(exam.start_time)) {
    commonHelpers.throwCustomError('Exam is not started yet', 400);
  }

  const totalScore = await userExamHelpers.calculateUserScore(userExam.id);

  await UserExam.update(
    {
      status: 'completed',
      score: totalScore
    },
    {
      where: {
        id: id
      }
    }
  );

  return { message: 'Exam submited successfully', score: totalScore };
}

module.exports = { createAnswer, getUserScore, submitExam };
