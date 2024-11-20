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

    if (question.type === 'single_choice' && optionIds.length > 1) {
      commonHelpers.throwCustomError(
        'Cannot select multiple options for the single choice type question',
        400,
      );
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

    const validOptionIds = question.Options?.map(option => option.id);

    // find the prev selected options and
    // if any of the optoins is not present in current selection then delete it
    // and if present then do nothing and if new option then create it
    const prevAns = await Answer.findAll({
      where: { user_exam_id: id, question_id: questionId },
      attributes: ['id', 'option_id'],
    });

    const prevAnswerIds = prevAns.map(ans => ans.option_id);

    const ansToCreate = question.Options.reduce((acc, option) => {
      if (!prevAnswerIds.includes(option.id)) {
        acc?.push({
          option_id: option.id,
          question_id: questionId,
          user_exam_id: id,
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

    let createdAnswers;
    let modifyCount;

    if (ansToDelete && ansToDelete.length) {
      modifyCount = await Answer.destroy(
        {
          where: {
            id: {
              [Op.in]: ansToDelete,
            },
          },
        },
        {
          transaction: transactionContext,
        },
      );
    }

    if (ansToCreate && ansToCreate.length) {
      createdAnswers = await Answer.bulkCreate(ansToCreate, {
        transaction: transactionContext,
        returning: true,
      });
    }

    await transactionContext.commit();

    return { createdAnswers, modifyCount };
  } catch (err) {
    await transactionContext.rollback();
    throw err;
  }
}

// calculate user score for the exam
async function calculateUserScore(currentUser, params) {
  const { id } = params;
  const roles = currentUser.roles;
  const { isUser } = commonHelpers.getRolesAsBool(roles);

  const transactionContext = await sequelize.transaction();

  try {
    const userExam = await UserExam.findOne({
      where: { id: id },
    });

    if (!userExam) {
      commonHelpers.throwCustomError('User Exam not found', 404);
    }

    if (isUser && userExam.user_id !== currentUser.id) {
      commonHelpers.throwCustomError('Can not see result of other user', 403);
    }

    if (userExam.status === 'on-going' || userExam.status === 'pending') {
      commonHelpers.throwCustomError('User has not completed the exam', 400);
    }

    if (userExam.score !== null) {
      return userExam.score;
    }

    const questionAnswers = await Question.findAll({
      where: {
        exam_id: userExam.exam_id,
      },
      attributes: ['id', 'type', 'negative_marks'],
      include: [
        {
          model: Option,
          attributes: ['id', 'marks', 'is_correct'],
          required: true,
        },
        {
          model: Answer,
          attributes: ['id', 'option_id'],
        },
      ],
    });

    let totalScore = 0;

    questionAnswers.forEach(question => {
      let answers = question.Answers;
      let options = question.Options;

      if (question.type === 'single_choice') {
        if (answers?.length === 0) {
          return;
        } else if (answers?.length > 1) {
          totalScore += question.negative_marks;
        } else {
          const selectedOption = options.find(
            option => option.id === answers[0].option_id,
          );

          if (selectedOption && selectedOption.is_correct) {
            totalScore += selectedOption.marks;
          } else {
            totalScore += question.negative_marks;
          }
        }
      } else {
        let isIncorrect = false;
        let questionMarks = 0;

        for (let answer of answers) {
          const selectedOption = options.find(
            option => option.id === answer.option_id,
          );

          if (selectedOption) {
            if (selectedOption.is_correct) {
              questionMarks += selectedOption.marks;
            } else {
              isIncorrect = true;
              break;
            }
          }
        }

        if (isIncorrect) {
          totalScore += question.negative_marks;
        } else {
          totalScore += questionMarks;
        }
      }
    });

    await UserExam.update(
      { score: totalScore },
      {
        where: { id: id },
        transaction: transactionContext,
      },
    );

    await transactionContext.commit();

    return totalScore;
  } catch (err) {
    await transactionContext.rollback();
    throw err;
  }
}

module.exports = { createAnswer, calculateUserScore };
