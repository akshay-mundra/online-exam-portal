const { Option, sequelize } = require('../models');

async function create(questionId, payload) {
  const { option, isCorrect, marks } = payload;
  const transactionContext = await sequelize.transaction();

  try {
    const createdQuestion = await Option.create(
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

    return createdQuestion;
  } catch (err) {
    await transactionContext.rollback();
    throw err;
  }
}

module.exports = { create };
