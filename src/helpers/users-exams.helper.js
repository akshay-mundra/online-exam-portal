const { Question, Option, Answer } = require('../models');

/**
 * Calculate the user score for the user exam.
 *
 * @param {userExamId} userExamId - users-exams id for that user and exam
 * @returns {number} The score of the user for that exam
 */
async function calculateUserScore(userExamId) {
  const questionAnswers = await Question.findAll({
    where: {
      exam_id: userExamId
    },
    attributes: ['id', 'type', 'negative_marks'],
    include: [
      {
        model: Option,
        attributes: ['id', 'marks', 'is_correct'],
        required: true
      },
      {
        model: Answer,
        attributes: ['id', 'option_id']
      }
    ]
  });

  let totalScore = 0;

  questionAnswers.forEach(question => {
    const answers = question.Answers;
    const options = question.Options;

    if (question.type === 'single_choice') {
      if (answers?.length === 0) {
        return;
      } else if (answers?.length > 1) {
        totalScore += question.negative_marks;
      } else {
        const selectedOption = options.find(option => option.id === answers[0].option_id);

        if (selectedOption && selectedOption.is_correct) {
          totalScore += selectedOption.marks;
        } else {
          totalScore += question.negative_marks;
        }
      }
    } else {
      let isIncorrect = false;
      let questionMarks = 0;

      for (const answer of answers) {
        const selectedOption = options.find(option => option.id === answer.option_id);

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

  return totalScore;
}

module.exports = { calculateUserScore };
