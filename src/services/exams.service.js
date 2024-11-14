const { Exam, User, UserExam, Question, Option } = require('../models');
const commonHelpers = require('../helpers/common.helper');
const { sequelize } = require('../models');
const { Op } = require('sequelize');

async function getAll(currentUser, page = 0) {
  const roles = currentUser.roles;
  const { limit, offset } = commonHelpers.getPaginationAttributes(page);
  const { isSuperAdmin } = commonHelpers.getRolesAsBool(roles);

  const options = {
    where: isSuperAdmin ? {} : { admin_id: currentUser.id },
    offset,
    limit,
  };

  const { count: total, rows: exams } = await Exam.findAndCountAll(options);

  return {
    exams,
    total,
  };
}

async function create(currentUser, payload) {
  const { title, startTime, endTime } = payload;
  const transactionContext = await sequelize.transaction();

  try {
    const exam = await Exam.create(
      {
        title,
        start_time: startTime,
        end_time: endTime,
        admin_id: currentUser.id,
      },
      { transaction: transactionContext },
    );
    await transactionContext.commit();
    return {
      title: exam.title,
      id: exam.id,
    };
  } catch (err) {
    await transactionContext.rollback();
    throw err;
  }
}

async function get(currentUser, id) {
  const roles = currentUser.roles;
  const { isSuperAdmin, isAdmin, isUser } = commonHelpers.getRolesAsBool(roles);
  let exam;

  const options = {
    where: isSuperAdmin || isUser ? { id } : { id, admin_id: currentUser.id },
  };

  if (isSuperAdmin || isAdmin) {
    exam = await Exam.findOne(options);
  } else if (isUser) {
    const userExam = await UserExam.findOne({
      where: { exam_id: id, user_id: currentUser.id },
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
        where: { id, admin_id: currentUser.id },
        returning: true,
      },
      {
        transaction: transactionContext,
      },
    );

    if (updateRowCount === 0) {
      commonHelpers.throwCustomError('Exam not found', 404);
    }

    await transactionContext.commit();

    return updatedExam;
  } catch (err) {
    await transactionContext.rollback();
    throw err;
  }
}

async function remove(currentUser, id) {
  const transactionContext = await sequelize.transaction();

  try {
    const countChanged = await Exam.destroy(
      { where: { id, admin_id: currentUser.id } },
      { transaction: transactionContext },
    );
    if (countChanged === 0) {
      commonHelpers.throwCustomError('exam not found', 404);
    }
    await transactionContext.commit();

    return { message: 'Exam deleted successfully!' };
  } catch (err) {
    await transactionContext.rollback();
    throw err;
  }
}

// add user to exam if user exist and is created by that admin.
async function addUser(currentUser, id, payload) {
  const { userId } = payload;
  const transactionContext = await sequelize.transaction();

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      commonHelpers.throwCustomError('User not found', 404);
    }
    if (user.admin_id !== currentUser.id) {
      commonHelpers.throwCustomError(
        'Can not add user that is not created by you',
        403,
      );
    }
    const [userExam, isCreated] = await UserExam.findOrCreate({
      where: { user_id: userId, exam_id: id },
      defaults: {
        user_id: userId,
        exam_id: id,
      },
      transaction: transactionContext,
    });

    if (!isCreated) {
      commonHelpers.throwCustomError('User is already assigned this exam', 400);
    }

    await transactionContext.commit();

    return userExam;
  } catch (err) {
    await transactionContext.rollback();
    throw err;
  }
}

// get all users for that exam
async function getAllUsers(currentUser, id, query) {
  const { page } = query;
  const { limit, offset } = commonHelpers.getPaginationAttributes(page);

  const users = await User.findAll({
    attributes: ['id', 'first_name', 'last_name', 'email'],
    include: [
      {
        model: Exam,
        where: { id, admin_id: currentUser.id },
        attributes: ['id'],
        through: {
          attributes: ['id', 'score', 'status'],
        },
        required: true,
      },
    ],
    offset,
    limit,
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
        where:
          isSuperAdmin || isUser ? { id } : { id, admin_id: currentUser.id },
        attributes: ['id'],
        through: {
          attributes: ['id', 'score', 'status'],
        },
        required: true,
      },
    ],
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

// create question for exam
async function createQuestion(currentUser, id, payload) {
  const { question, type, negativeMarks, options } = payload;
  const transactionContext = await sequelize.transaction();

  try {
    if (!options || !options.length) {
      commonHelpers.throwCustomError('options are required', 400);
    }
    const exam = await Exam.findByPk(id);
    if (!exam) {
      commonHelpers.throwCustomError('Exam not found');
    }
    if (exam.admin_id !== currentUser.id) {
      commonHelpers.throwCustomError('Insufficient access', 403);
    }

    const createdQuestion = await Question.create(
      { exam_id: id, question, type, negative_marks: negativeMarks },
      { transaction: transactionContext },
    );

    const createdOptions = await Option.bulkCreate(
      options.map(option => {
        return {
          question_id: createdQuestion.id,
          option: option.option,
          is_correct: option.isCorrect,
          marks: option.marks,
        };
      }),
      {
        transaction: transactionContext,
      },
    );

    await transactionContext.commit();

    return { createdQuestion, createdOptions };
  } catch (err) {
    transactionContext.rollback();
    throw err;
  }
}

// get all questions for the exam
async function getAllQuestions(currentUser, id, query) {
  const { page } = query;
  const roles = currentUser.roles;
  const { limit, offset } = commonHelpers.getPaginationAttributes(page);
  const { isSuperAdmin, isAdmin, isUser } = commonHelpers.getRolesAsBool(roles);
  let questions;

  const whereCondition =
    isSuperAdmin || isUser ? { id } : { id, admin_id: currentUser.id };

  const options = {
    attributes: ['id', 'question', 'type', 'negative_marks'],
    include: [
      {
        model: Exam,
        as: 'exams',
        where: whereCondition,
        attributes: [],
        required: true,
      },
    ],
    offset,
    limit,
  };

  if (isSuperAdmin || isAdmin) {
    questions = await Question.findAll(options);
  } else if (isUser) {
    const userExam = await UserExam.findOne({
      where: { user_id: currentUser.id, exam_id: id },
    });

    if (!userExam) {
      commonHelpers.throwCustomError('User is not assigned to this exam', 403);
    }

    questions = await Question.findAll(options);
  }

  return questions;
}

async function getQuestion(currentUser, id, questionId) {
  const roles = currentUser.roles;

  const userCanSee = ['id', 'option', 'marks'];
  const adminCanSee = [...userCanSee, 'is_correct'];

  const { isSuperAdmin, isAdmin, isUser } = commonHelpers.getRolesAsBool(roles);

  let question;
  const whereCondition =
    isSuperAdmin || isUser ? { id } : { id, admin_id: currentUser.id };

  const options = {
    where: { id: questionId },
    attributes: ['id', 'question', 'type', 'negative_marks'],
    include: [
      {
        model: Option,
        attributes: isSuperAdmin || isAdmin ? adminCanSee : userCanSee,
        required: true,
      },
      {
        model: Exam,
        as: 'exams',
        where: whereCondition,
        attributes: [],
      },
    ],
  };

  if (isSuperAdmin || isAdmin) {
    question = await Question.findOne(options);
  } else if (isUser) {
    const userExam = await UserExam.findOne({
      where: { user_id: currentUser.id, exam_id: id },
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

async function updateQuestion(currentUser, id, questionId, payload) {
  const { question, type, negativeMarks, options } = payload;
  const transactionContext = await sequelize.transaction();

  try {
    const [updateRowCount, updatedQuestion] = await Question.update(
      {
        question,
        type,
        negative_marks: negativeMarks,
      },
      {
        where: { id: questionId, exam_id: id },
        returning: true,
        include: [
          {
            model: Exam,
            where: { admin_id: currentUser.id },
            attributes: [],
            required: true,
          },
        ],
      },
      {
        transaction: transactionContext,
      },
    );

    if (updateRowCount === 0) {
      commonHelpers.throwCustomError('Question not found', 404);
    }

    const optionsToEdit = options.filter(option => option.id && !option.delete);
    const optionsToDelete = options.filter(
      option => option.delete && option.id,
    );
    const optionsToCreate = options.filter(
      option => !option.id && !option.delete,
    );

    const updatedOptions = await Promise.all(
      optionsToEdit.map(option =>
        Option.update(
          {
            option: option.option,
            is_correct: option.isCorrect,
            marks: option.marks,
          },
          {
            where: { id: option.id, question_id: questionId },
          },
          { transaction: transactionContext },
        ),
      ),
    );

    const createdOptions = await Option.bulkCreate(
      optionsToCreate.map(option => {
        return {
          question_id: questionId,
          option: option.option,
          is_correct: option.isCorrect,
          marks: option.marks,
        };
      }),
      {
        transaction: transactionContext,
      },
    );

    await Option.destroy({
      where: { id: { [Op.in]: optionsToDelete.map(option => option.id) } },
      transaction: transactionContext,
    });

    await transactionContext.commit();

    return {
      updatedQuestion,
      createdOptions,
      updatedOptions,
    };
  } catch (err) {
    await transactionContext.rollback();
    throw err;
  }
}

module.exports = {
  getAll,
  create,
  get,
  update,
  remove,
  addUser,
  getAllUsers,
  getUser,
  createQuestion,
  getAllQuestions,
  getQuestion,
  updateQuestion,
};
