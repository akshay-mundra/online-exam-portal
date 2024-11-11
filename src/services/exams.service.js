const { Exam, User } = require('../models');
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

module.exports = { getAll, create, get, update, remove };
