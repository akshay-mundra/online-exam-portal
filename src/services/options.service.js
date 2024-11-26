const { Option } = require('../models');
const commonHelpers = require('../helpers/common.helper');

// create a option for the question
async function create(questionId, payload) {
  const { option, isCorrect, marks } = payload;

  const createdOption = await Option.create({
    option,
    is_correct: isCorrect,
    marks,
    question_id: questionId
  });

  return createdOption;
}

// update the option
async function update(id, payload) {
  const { option, isCorrect, marks } = payload;

  const [updateRowCount, updatedOption] = await Option.update(
    {
      option,
      is_correct: isCorrect,
      marks
    },
    {
      where: { id },
      returning: true
    }
  );

  if (!updateRowCount) {
    commonHelpers.throwCustomError('Option not found', 404);
  }

  return updatedOption;
}

// remove the option
async function remove(id) {
  const rowsModified = await Option.destroy({ where: { id } });

  if (rowsModified === 0) {
    commonHelpers.throwCustomError('Option not found', 404);
  }

  return 'Option deleted successfully';
}

module.exports = { create, update, remove };
