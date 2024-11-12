const { Exam, User, UserExam } = require('../models');
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
  const { title, start_time, end_time } = payload;
  const transactionContext = await sequelize.transaction();

  try {
    const exam = await Exam.create(
      {
        title,
        start_time,
        end_time,
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
  const { title, start_time, end_time } = payload;
  const transactionContext = await sequelize.transaction();

  try {
    const [updateRowCount, updatedExam] = await Exam.update(
      { title, start_time, end_time },
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
  const { user_id } = payload;
  const transactionContext = await sequelize.transaction();

  try {
    const user = await User.findByPk(user_id);
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
      where: { user_id, exam_id: id },
      defaults: {
        user_id,
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

// get a user and its details for this exam
async function getUser(currentUser, userId, id) {
  const examUser = await Exam.findOne({
    where: { id, admin_id: currentUser.id },
    include: [
      {
        model: User,
        attributes: ['first_name', 'last_name', 'email'],
        through: {
          attributes: ['score', 'status'],
        },
      },
    ],
  });
  if (!examUser) {
    commonHelpers.throwCustomError('User not found', 404);
  }

  return {
    users: examUser.Users,
  };
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
};
