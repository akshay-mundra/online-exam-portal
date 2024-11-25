const { Question, Option, Exam } = require('../models');

// get question with options and exams
async function getQuestionExamOptions(id, userId, optionCondition) {
  const optionWhereCondition = { question_id: id, ...optionCondition };

  return await Question.findOne({
    where: { id },
    include: [
      {
        model: Exam,
        as: 'exams',
        where: { admin_id: userId }
      },
      {
        model: Option,
        where: optionWhereCondition,
        required: true
      }
    ]
  });
}

// single choice question should have only one option as correct
function checkOptionsSingleChoice(options) {
  let count = 0;
  for (const option of options) {
    if (option.is_correct || option.isCorrect) count++;
  }

  return count;
}

module.exports = { checkOptionsSingleChoice, getQuestionExamOptions };
