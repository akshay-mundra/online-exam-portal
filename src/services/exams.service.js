const { Exam, User, UserExam, Question, Option } = require('../models');
const commonHelpers = require('../helpers/common.helper');
const { sequelize } = require('../models');

async function getAll(currentUser, page = 0) {
  const roles = currentUser.roles;
  const LIMIT = 10;
  const offset = page * LIMIT;
  let exams, total;

  if (roles.includes('super_admin')) {
    const { count, rows } = await Exam.findAll({
      offset,
      limit: LIMIT,
    });
    exams = rows;
    total = count;
  } else if (roles.includes('admin')) {
    const { count, rows } = await Exam.findAndCountAll({
      where: {
        admin_id: currentUser.id,
      },
      offset,
      limit: LIMIT,
    });
    exams = rows;
    total = count;
  }
  if (total === 0) {
    commonHelpers.throwCustomError('No exams found', 404);
  }

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
  let exam;

  if (roles.includes('super_admin')) {
    exam = await Exam.findOne({
      where: {
        id,
      },
    });
  } else if (roles.includes('admin')) {
    exam = await Exam.findOne({
      where: {
        id,
        admin_id: currentUser.id,
      },
    });
  } else if (roles.includes('user')) {
    exam = await Exam.findOne({
      where: {
        id,
      },
      include: [
        {
          model: User,
          through: {
            attributes: ['user_id', 'exam_id'],
            where: { user_id: currentUser.id, exam_id: id },
            required: true,
          },
          required: true,
        },
      ],
    });
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
      { title, start_time: startTime, endTime },
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
      where: { userId, exam_id: id },
      defaults: {
        userId,
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
async function getAllUsers(currentUser, id) {
  const users = await Exam.findAll({
    where: { id, admin_id: currentUser.id },
    include: [
      {
        model: User,
        attributes: ['id', 'first_name', 'last_name', 'email'],
        through: {
          attributes: ['id', 'score', 'status'],
        },
      },
    ],
    plain: true,
  });
  if (users?.length === 0) {
    commonHelpers.throwCustomError('No users assigned for this exam', 404);
  }
  console.log(users);
  return users;
}

// get a user and its details for this exam (only admin and the user itself and access)
async function getUser(currentUser, userId, id) {
  const roles = currentUser.roles;
  let examUser;
  const options = {
    where:
      roles.includes('super_admin') || roles.includes('user')
        ? { id }
        : { id, admin_id: currentUser.id },
    include: [
      {
        model: User,
        attributes: ['first_name', 'last_name', 'email'],
        where: { id: userId },
        through: {
          attributes: ['score', 'status'],
        },
        required: true,
      },
    ],
  };

  if (roles.includes('super_admin') || roles.includes('admin')) {
    examUser = await Exam.findOne(options);
  } else if (roles.includes('user')) {
    if (currentUser.id !== userId) {
      commonHelpers.throwCustomError('Can not access other user', 403);
    }
    examUser = await Exam.findOne(options);
  }
  if (!examUser || examUser?.Users.length === 0) {
    commonHelpers.throwCustomError('User not found', 404);
  }

  return {
    users: examUser?.Users,
  };
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
    const createdOptions = await Promise.all(
      options.map(option =>
        Option.create(
          {
            question_id: createdQuestion.id,
            option: option.option,
            is_correct: option.isCorrect,
            marks: option.marks,
          },
          { transaction: transactionContext },
        ),
      ),
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
  const LIMIT = 10;
  const OFFSET = LIMIT * (page || 0);
  const roles = currentUser.roles;

  const isAdminOrSuperAdmin =
    roles.includes('super_admin') || roles.includes('admin');
  const isUser = roles.includes('user');
  const whereCondition =
    isAdminOrSuperAdmin || isUser ? { id } : { id, admin_id: currentUser.id };

  const options = {
    where: whereCondition,
    attributes: ['id'],
    include: [
      {
        model: Question,
        attributes: ['id', 'question', 'type', 'negative_marks'],
        required: true,
        offset: OFFSET,
        limit: LIMIT,
      },
    ],
  };
  let questions;

  if (isAdminOrSuperAdmin) {
    questions = await Exam.findOne(options);
  } else if (isUser) {
    const userExam = await UserExam.findOne({
      where: { user_id: currentUser.id, exam_id: id },
    });
    if (!userExam) {
      commonHelpers.throwCustomError('User is not assigned to this exam', 403);
    }
    questions = await Exam.findOne(options);
  }

  if (!questions || questions.Quesitons?.length === 0) {
    commonHelpers.throwCustomError('No questions found for the exam', 404);
  }

  return questions;
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
};
