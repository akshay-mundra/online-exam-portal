const { Option, sequelize } = require('../models');
const commonHelpers = require('../helpers/common.helper');

// create a option for the question
async function create(questionId, payload) {
  const { option, isCorrect, marks } = payload;
  const transactionContext = await sequelize.transaction();

  try {
    const createdOption = await Option.create(
      {
        option,
        is_correct: isCorrect,
        marks,
        question_id: questionId,
      },
      {
        transaction: transactionContext,
      },
    );

    await transactionContext.commit();

    return createdOption;
  } catch (err) {
    await transactionContext.rollback();
    throw err;
  }
}

// update the option
async function update(id, payload) {
  const { option, isCorrect, marks } = payload;
  const transactionContext = await sequelize.transaction();

  try {
    const [updateRowCount, updatedOption] = await Option.update(
      {
        option,
        is_correct: isCorrect,
        marks,
      },
      {
        where: { id },
        returning: true,
      },
      {
        transaction: transactionContext,
      },
    );

    if (!updateRowCount) {
      commonHelpers.throwCustomError('Option not found', 404);
    }

    await transactionContext.commit();

    return updatedOption;
  } catch (err) {
    await transactionContext.rollback();
    throw err;
  }
}

// remove the option
async function remove(id) {
  const transactionContext = await sequelize.transaction();

  try {
    const rowsModified = await Option.destroy(
      { where: { id } },
      { transaction: transactionContext },
    );

    if (rowsModified === 0) {
      commonHelpers.throwCustomError('Option not found', 404);
    }

    await transactionContext.commit();

    return 'Option deleted successfully';
  } catch (err) {
    await transactionContext.rollback();
    throw err;
  }
}

module.exports = { create, update, remove };
