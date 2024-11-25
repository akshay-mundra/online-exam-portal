const { Exam, User, UserExam, Question, Option } = require('../models');
const commonHelpers = require('../helpers/common.helper');
const { sequelize } = require('../models');
const moment = require('moment');
const questionHelpers = require('../helpers/questions.helper');
const { calculateUserScore } = require('../services/users-exams.service');
const { Op } = require('sequelize');

// get all exams
async function getAll(currentUser, query) {
  const { limit: queryLimit, page = 0, isPublished } = query;
  const { limit, offset } = commonHelpers.getPaginationAttributes(page, queryLimit);

  const roles = currentUser.roles;
  const { isSuperAdmin } = commonHelpers.getRolesAsBool(roles);

  const filters = {};
  if (isPublished !== undefined) {
    filters.is_published = isPublished;
  }

  const options = {
    where: isSuperAdmin ? { ...filters } : { admin_id: currentUser.id, ...filters },
    offset,
    limit
  };

  const { count: total, rows: exams } = await Exam.findAndCountAll(options);

  return {
    exams,
    total
  };
}

// create new exam
async function create(currentUser, payload) {
  const { title, startTime, endTime } = payload;
  const transactionContext = await sequelize.transaction();

  try {
    const exam = await Exam.create(
      {
        title,
        start_time: startTime,
        end_time: endTime,
        admin_id: currentUser.id
      },
      { transaction: transactionContext }
    );

    await transactionContext.commit();

    return exam;
  } catch (error) {
    await transactionContext.rollback();
    throw error;
  }
}

// get single exam by id
async function get(currentUser, id) {
  const roles = currentUser.roles;
  const { isSuperAdmin, isAdmin, isUser } = commonHelpers.getRolesAsBool(roles);
  let exam;

  const options = {
    where: isSuperAdmin || isUser ? { id } : { id, admin_id: currentUser.id }
  };

  if (isSuperAdmin || isAdmin) {
    exam = await Exam.findOne(options);
  } else if (isUser) {
    const userExam = await UserExam.findOne({
      where: { exam_id: id, user_id: currentUser.id }
    });

    if (!userExam) {
      commonHelpers.throwCustomError('User is not assigned to this exam', 403);
    }

    exam = await Exam.findOne(options);
  }

  if (!exam) {
    commonHelpers.throwCustomError('Exam not found', 404);
  }
  return exam;
}

// update exam details only the admin who created it can update the exam.
async function update(currentUser, id, payload) {
  const { title, startTime, endTime } = payload;
  const transactionContext = await sequelize.transaction();

  try {
    const [updateRowCount, updatedExam] = await Exam.update(
      { title, start_time: startTime, end_time: endTime },
      {
        where: { id, admin_id: currentUser.id, is_published: false },
        returning: true
      },
      {
        transaction: transactionContext
      }
    );

    if (updateRowCount === 0) {
      commonHelpers.throwCustomError('Exam not found or already published', 404);
    }

    await transactionContext.commit();

    return updatedExam;
  } catch (error) {
    await transactionContext.rollback();
    throw error;
  }
}

// remove exam by id
async function remove(currentUser, id) {
  const transactionContext = await sequelize.transaction();

  try {
    const currentTime = moment.utc();

    const countChanged = await Exam.destroy(
      {
        where: {
          id,
          admin_id: currentUser.id,
          [Op.or]: [
            {
              start_time: {
                [Op.gt]: currentTime.toDate()
              }
            },
            {
              end_time: {
                [Op.lt]: currentTime.toDate()
              }
            }
          ]
        }
      },
      { transaction: transactionContext }
    );
    if (countChanged === 0) {
      commonHelpers.throwCustomError('exam not found or exam is currently on going', 404);
    }

    await transactionContext.commit();

    return { message: 'Exam deleted successfully!', countChanged };
  } catch (error) {
    await transactionContext.rollback();
    throw error;
  }
}

// get result of all the users in that exam
async function getResult(currentUser, id) {
  const exam = await Exam.findByPk(id);

  if (!exam) {
    commonHelpers.throwCustomError('Exam not found', 404);
  }

  const currentTime = moment.utc();
  if (currentTime.isBefore(exam.end_time)) {
    commonHelpers.throwCustomError('Exam is not ended yet', 400);
  }

  const users = await User.findAll({
    where: {},
    include: [
      {
        model: Exam,
        where: { id: id },
        through: {
          where: { status: 'completed' },
          attributes: ['id', 'score']
        },
        required: true,
        plain: true
      }
    ]
  });

  const results = [];

  for (const user of users) {
    const score = await calculateUserScore(user, user.Exams[0].users_exams);
    results.push({
      score: score,
      user: {
        email: user.email,
        firstName: user.first_name,
        lastName: user.lastName
      }
    });
  }

  return results;
}

// add user to exam if user exist and is created by that admin.
async function addUser(currentUser, id, payload) {
  const { userId } = payload;
  const transactionContext = await sequelize.transaction();

  try {
    const exam = await Exam.findByPk(id);

    if (!exam) {
      commonHelpers.throwCustomError('Exam not found', 404);
    }

    if (exam.is_published) {
      commonHelpers.throwCustomError('Exam is already published', 400);
    }

    const user = await User.findByPk(userId);

    if (!user) {
      commonHelpers.throwCustomError('User not found', 404);
    }

    if (user.admin_id !== currentUser.id) {
      commonHelpers.throwCustomError('Can not add user that is not created by you', 403);
    }

    const [userExam, isCreated] = await UserExam.findOrCreate({
      where: { user_id: userId, exam_id: id },
      defaults: {
        user_id: userId,
        exam_id: id
      },
      transaction: transactionContext
    });

    if (!isCreated) {
      commonHelpers.throwCustomError('User is already assigned this exam', 400);
    }

    await transactionContext.commit();

    return userExam;
  } catch (error) {
    await transactionContext.rollback();
    throw error;
  }
}

// get all users for that exam
async function getAllUsers(currentUser, id, query) {
  const { page, limit: queryLimit } = query;
  const { limit, offset } = commonHelpers.getPaginationAttributes(page, queryLimit);

  const users = await User.findAll({
    attributes: ['id', 'first_name', 'last_name', 'email'],
    include: [
      {
        model: Exam,
        where: { id, admin_id: currentUser.id },
        attributes: ['id'],
        through: {
          attributes: ['id', 'score', 'status'],
          where: { deleted_at: null }
        },
        required: true
      }
    ],
    offset,
    limit
  });

  return users;
}

// get a user and its details for this exam (only admin and the user itself and access)
async function getUser(currentUser, userId, id) {
  const roles = currentUser.roles;
  const { isSuperAdmin, isAdmin, isUser } = commonHelpers.getRolesAsBool(roles);
  let user;

  const options = {
    where: { id: userId },
    attributes: ['first_name', 'last_name', 'email'],
    include: [
      {
        model: Exam,
        where: isSuperAdmin || isUser ? { id } : { id, admin_id: currentUser.id },
        attributes: ['id'],
        through: {
          attributes: ['id', 'score', 'status'],
          where: { deleted_at: null }
        },
        required: true
      }
    ]
  };

  if (isSuperAdmin || isAdmin) {
    user = await User.findOne(options);
  } else if (isUser) {
    if (currentUser.id !== userId) {
      commonHelpers.throwCustomError('Can not access other user', 403);
    }

    user = await User.findOne(options);
  }

  if (!user) {
    commonHelpers.throwCustomError('User not found', 404);
  }

  return user;
}

// remove user from exam
async function removeUser(currentUser, userId, id) {
  const transactionContext = await sequelize.transaction();

  try {
    const user = await User.findOne({
      where: { id: userId, admin_id: currentUser.id }
    });
    if (!user) {
      commonHelpers.throwCustomError('User not found', 404);
    }

    const exam = await Exam.findOne({
      where: { id: id, admin_id: currentUser.id }
    });

    if (!exam) {
      commonHelpers.throwCustomError('Exam not found', 404);
    }

    if (exam.is_published) {
      commonHelpers.throwCustomError('Exam is already published', 400);
    }

    const modifyCount = await UserExam.destroy(
      { where: { user_id: userId, exam_id: id } },
      { transaction: transactionContext }
    );

    if (modifyCount === 0) {
      commonHelpers.throwCustomError('User is not associated to this exam', 403);
    }

    console.log(modifyCount);

    await transactionContext.commit();

    return 'User removed from exam successfully';
  } catch (error) {
    await transactionContext.rollback();
    throw error;
  }
}

// create question for exam
async function createQuestion(currentUser, id, payload) {
  const { question, type, negativeMarks, options } = payload;
  const transactionContext = await sequelize.transaction();

  try {
    if (!options || options.length === 0) {
      commonHelpers.throwCustomError('options are required', 400);
    }

    const exam = await Exam.findByPk(id);

    if (!exam) {
      commonHelpers.throwCustomError('Exam not found');
    }

    if (exam.admin_id !== currentUser.id) {
      commonHelpers.throwCustomError('Insufficient access', 403);
    }

    if (exam.is_published) {
      commonHelpers.throwCustomError('Exam is already published', 400);
    }

    if (type === 'single_choice' && questionHelpers.checkOptionsSingleChoice(options) > 1) {
      commonHelpers.throwCustomError('Single choice question can not have multiple correct options', 400);
    }

    const createdQuestion = await Question.create(
      { exam_id: id, question, type, negative_marks: negativeMarks },
      { transaction: transactionContext }
    );

    const createdOptions = await Option.bulkCreate(
      options.map(option => {
        return {
          question_id: createdQuestion.id,
          option: option.option,
          is_correct: option.isCorrect,
          marks: option.marks
        };
      }),
      {
        transaction: transactionContext
      }
    );

    await transactionContext.commit();

    return { ...createdQuestion.dataValues, options: createdOptions };
  } catch (error) {
    transactionContext.rollback();
    throw error;
  }
}

// get all questions for the exam
async function getAllQuestions(currentUser, id, query) {
  const { page, limit: queryLimit } = query;
  const roles = currentUser.roles;
  const { limit, offset } = commonHelpers.getPaginationAttributes(page, queryLimit);
  const { isSuperAdmin, isAdmin, isUser } = commonHelpers.getRolesAsBool(roles);
  let questions;

  const whereCondition = isSuperAdmin || isUser ? { id } : { id, admin_id: currentUser.id };

  const options = {
    attributes: ['id', 'question', 'type', 'negative_marks'],
    include: [
      {
        model: Exam,
        as: 'exams',
        where: whereCondition,
        attributes: [],
        required: true
      }
    ],
    offset,
    limit
  };

  if (isSuperAdmin || isAdmin) {
    questions = await Question.findAll(options);
  } else if (isUser) {
    const userExam = await UserExam.findOne({
      where: { user_id: currentUser.id, exam_id: id }
    });

    if (!userExam) {
      commonHelpers.throwCustomError('User is not assigned to this exam', 403);
    }

    questions = await Question.findAll(options);
  }

  return questions;
}

// get single question details with options by exam id and questionId
async function getQuestion(currentUser, id, questionId) {
  const roles = currentUser.roles;

  const userCanSee = ['id', 'option', 'marks'];
  const adminCanSee = [...userCanSee, 'is_correct'];

  const { isSuperAdmin, isAdmin, isUser } = commonHelpers.getRolesAsBool(roles);

  let question;
  const whereCondition = isSuperAdmin || isUser ? { id } : { id, admin_id: currentUser.id };

  const options = {
    where: { id: questionId },
    attributes: ['id', 'question', 'type', 'negative_marks'],
    include: [
      {
        model: Option,
        attributes: isSuperAdmin || isAdmin ? adminCanSee : userCanSee,
        required: true
      },
      {
        model: Exam,
        as: 'exams',
        where: whereCondition,
        attributes: []
      }
    ]
  };

  if (isSuperAdmin || isAdmin) {
    question = await Question.findOne(options);
  } else if (isUser) {
    const userExam = await UserExam.findOne({
      where: { user_id: currentUser.id, exam_id: id }
    });

    if (!userExam) {
      commonHelpers.throwCustomError('User is not assigned to this exam', 403);
    }

    question = await Question.findOne(options);
  }

  if (!question) {
    commonHelpers.throwCustomError('Question not found', 404);
  }

  return question;
}

// update question details by exam id and questionId
async function updateQuestion(currentUser, id, questionId, payload) {
  const { question, type, negativeMarks } = payload;
  const transactionContext = await sequelize.transaction();

  try {
    const [updateRowCount, updatedQuestion] = await Question.update(
      {
        question,
        type,
        negative_marks: negativeMarks
      },
      {
        where: { id: questionId, exam_id: id },
        returning: true,
        include: [
          {
            model: Exam,
            where: { admin_id: currentUser.id },
            attributes: [],
            required: true
          }
        ]
      },
      {
        transaction: transactionContext
      }
    );

    if (updateRowCount === 0) {
      commonHelpers.throwCustomError('Question not found', 404);
    }

    await transactionContext.commit();

    return updatedQuestion;
  } catch (error) {
    await transactionContext.rollback();
    throw error;
  }
}

// remove question
async function removeQuestion(currentUser, id, questionId) {
  const transactionContext = await sequelize.transaction();

  try {
    const modifyCount = await Question.destroy(
      {
        where: { id: questionId, exam_id: id },
        include: [
          {
            model: Exam,
            where: { admin_id: currentUser.id },
            required: true
          }
        ]
      },
      {
        transaction: transactionContext
      }
    );

    if (modifyCount === 0) {
      commonHelpers.throwCustomError('Question not found', 404);
    }

    await transactionContext.commit();

    return 'question removed successfully';
  } catch (error) {
    await transactionContext.rollback();
    throw error;
  }
}

module.exports = {
  getAll,
  create,
  get,
  update,
  remove,
  getResult,
  addUser,
  getAllUsers,
  getUser,
  removeUser,
  createQuestion,
  getAllQuestions,
  getQuestion,
  updateQuestion,
  removeQuestion
};
