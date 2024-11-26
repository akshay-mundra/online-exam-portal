const { createAnswer, calculateUserScore, submitExam } = require('../../src/services/users-exams.service');
const { UserExam, Exam, Question, Option, Answer, sequelize } = require('../../src/models');
const commonHelpers = require('../../src/helpers/common.helper');
const moment = require('moment');

jest.mock('../../src/models', () => ({
  UserExam: {
    findOne: jest.fn(),
    update: jest.fn(),
    findByPk: jest.fn()
  },
  Exam: {
    findByPk: jest.fn()
  },
  Question: {
    findOne: jest.fn(),
    findAll: jest.fn()
  },
  Option: {
    findOne: jest.fn()
  },
  Answer: {
    findAll: jest.fn(),
    bulkCreate: jest.fn(),
    destroy: jest.fn()
  },
  sequelize: {
    transaction: jest.fn()
  }
}));

jest.mock('../../src/helpers/common.helper', () => ({
  throwCustomError: jest.fn(),
  getRolesAsBool: jest.fn()
}));

describe('Exam Service', () => {
  let transactionContext;

  beforeEach(() => {
    transactionContext = { commit: jest.fn(), rollback: jest.fn() };
    sequelize.transaction.mockResolvedValue(transactionContext);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAnswer', () => {
    describe('createAnswer', () => {
      it('should successfully create or update answers', async () => {
        const mockUserExam = {
          id: 1,
          user_id: 1,
          status: 'on-going',
          exam_id: 1
        };
        const mockExam = { id: 1, start_time: moment().subtract(1, 'hour') };
        const mockQuestion = {
          id: 1,
          exam_id: 1,
          type: 'single_choice',
          Options: [{ id: 1 }]
        };
        const mockOption = { id: 1, is_correct: true, marks: 2 };
        const mockAnswer = { option_id: 1, question_id: 1, user_exam_id: 1 };

        UserExam.findOne.mockResolvedValue(mockUserExam);
        Exam.findByPk.mockResolvedValue(mockExam);
        Question.findOne.mockResolvedValue(mockQuestion);
        Option.findOne.mockResolvedValue(mockOption);
        Answer.findAll.mockResolvedValue([]);
        Answer.bulkCreate.mockResolvedValue([mockAnswer]);
      });
    });

    it('should throw "User not match" error when user ids do not match', async () => {
      const mockUserExam = {
        id: 1,
        user_id: 2,
        status: 'on-going',
        exam_id: 1
      };
      UserExam.findOne.mockResolvedValue(mockUserExam);

      commonHelpers.throwCustomError.mockImplementation((message, statusCode) => {
        const error = new Error(message);
        error.statusCode = statusCode;
        throw error;
      });

      await expect(createAnswer({ id: 1 }, { id: 1 }, { questionId: 1, optionIds: [1] })).rejects.toThrow(
        'User not match'
      );
    });
  });

  describe('calculateUserScore', () => {
    it('should calculate and return the score for an exam', async () => {
      const mockUserExam = {
        id: 1,
        user_id: 1,
        exam_id: 1,
        status: 'completed',
        score: null
      };
      const mockQuestion = {
        id: 1,
        type: 'single_choice',
        negative_marks: -1,
        Options: [{ id: 1, is_correct: true, marks: 2 }],
        Answers: [{ option_id: 1 }]
      };

      UserExam.findOne.mockResolvedValue(mockUserExam);
      Question.findAll.mockResolvedValue([mockQuestion]);
      commonHelpers.getRolesAsBool.mockReturnValue({ isUser: true });

      await expect(calculateUserScore({ id: 1, roles: [] }, { id: 1 })).resolves.toBe(2);
    });

    it('should throw "User Exam not found" error if user exam is not found', async () => {
      UserExam.findOne.mockResolvedValue(null);

      commonHelpers.throwCustomError.mockImplementation((message, statusCode) => {
        const error = new Error(message);
        error.statusCode = statusCode;
        throw error;
      });

      await expect(calculateUserScore({ id: 1 }, { id: 1 })).rejects.toThrow('User Exam not found');
    });

    it('should handle incorrect answers for multiple-choice questions', async () => {
      const mockUserExam = {
        id: 1,
        user_id: 1,
        exam_id: 1,
        status: 'completed',
        score: null
      };
      const mockQuestion = {
        id: 1,
        type: 'multiple_choice',
        negative_marks: -2,
        Options: [
          { id: 1, is_correct: true, marks: 2 },
          { id: 2, is_correct: false, marks: 0 }
        ],
        Answers: [{ option_id: 1 }, { option_id: 2 }]
      };

      UserExam.findOne.mockResolvedValue(mockUserExam);
      Question.findAll.mockResolvedValue([mockQuestion]);
      commonHelpers.getRolesAsBool.mockReturnValue({ isUser: true });

      await expect(calculateUserScore({ id: 1, roles: [] }, { id: 1 })).resolves.toBe(-2);
    });
  });

  describe('submitExam', () => {
    it('should successfully submit an exam', async () => {
      const mockUserExam = {
        id: 1,
        user_id: 1,
        exam_id: 1,
        status: 'on-going'
      };
      const mockExam = { id: 1, start_time: moment().subtract(1, 'hour') };

      UserExam.findByPk.mockResolvedValue(mockUserExam);
      Exam.findByPk.mockResolvedValue(mockExam);

      await expect(submitExam({ id: 1 }, { id: 1 })).resolves.toBe('Exam submited successfully');
    });

    it('should throw "Can not access other user" error if user ids do not match', async () => {
      const mockUserExam = { id: 1, user_id: 2, status: 'on-going' };
      UserExam.findByPk.mockResolvedValue(mockUserExam);

      commonHelpers.throwCustomError.mockImplementation((message, statusCode) => {
        const error = new Error(message);
        error.statusCode = statusCode;
        throw error;
      });

      await expect(submitExam({ id: 1 }, { id: 1 })).rejects.toThrow('Can not access other user');
    });

    it('should throw "Exam is not started yet" error if exam has not started', async () => {
      const mockUserExam = {
        id: 1,
        user_id: 1,
        exam_id: 1,
        status: 'on-going'
      };
      const mockExam = { id: 1, start_time: moment().add(1, 'hour') };

      UserExam.findByPk.mockResolvedValue(mockUserExam);
      Exam.findByPk.mockResolvedValue(mockExam);

      await expect(submitExam({ id: 1 }, { id: 1 })).rejects.toThrow('Exam is not started yet');
    });
  });
});
