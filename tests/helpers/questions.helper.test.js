const { getQuestionExamOptions, checkOptionsSingleChoice } = require('../../src/helpers/questions.helper');
const { Question, Option, Exam } = require('../../src/models');

jest.mock('../../src/models', () => ({
  Question: {
    findOne: jest.fn()
  },
  Option: {},
  Exam: {}
}));

describe('Question Helper Functions', () => {
  describe('getQuestionExamOptions', () => {
    it('should fetch question, options, and exams based on conditions', async () => {
      const id = 1;
      const userId = 123;
      const optionCondition = { is_active: true };
      const mockQuestion = {
        id: 1,
        exams: [{ admin_id: userId }],
        options: [{ question_id: id, is_active: true }]
      };

      Question.findOne.mockResolvedValue(mockQuestion);

      const result = await getQuestionExamOptions(id, userId, optionCondition);

      expect(Question.findOne).toHaveBeenCalledWith({
        where: { id },
        include: [
          {
            model: Exam,
            as: 'exams',
            where: { admin_id: userId }
          },
          {
            model: Option,
            where: { question_id: id, ...optionCondition },
            required: true
          }
        ]
      });

      expect(result).toEqual(mockQuestion);
    });

    it('should return null if no question is found', async () => {
      const id = 1;
      const userId = 123;
      const optionCondition = { is_active: true };

      Question.findOne.mockResolvedValue(null);

      const result = await getQuestionExamOptions(id, userId, optionCondition);

      expect(result).toBeNull();
    });
  });

  describe('checkOptionsSingleChoice', () => {
    it('should return the correct count of correct options for single choice', () => {
      const options = [{ is_correct: true }, { isCorrect: true }, { is_correct: false }, { isCorrect: false }];

      const result = checkOptionsSingleChoice(options);

      expect(result).toBe(2);
    });

    it('should return 0 if no correct option is provided', () => {
      const options = [{ is_correct: false }, { isCorrect: false }];

      const result = checkOptionsSingleChoice(options);

      expect(result).toBe(0);
    });

    it('should handle edge case with empty options array', () => {
      const options = [];

      const result = checkOptionsSingleChoice(options);

      expect(result).toBe(0);
    });
  });
});
