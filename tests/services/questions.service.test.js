const {
  bulkCreate,
  createOption,
  getOption,
  updateOption,
  removeOption
} = require('../../src/services/questions.service');
const { Question, Option, Exam } = require('../../src/models');
const commonHelpers = require('../../src/helpers/common.helper');
const optionServices = require('../../src/services/options.service');
const questionHelpers = require('../../src/helpers/questions.helper');
const { sequelize } = require('../../src/models');

jest.mock('../../src/models');
jest.mock('../../src/helpers/common.helper');
jest.mock('../../src/services/options.service');
jest.mock('../../src/helpers/questions.helper');

describe('Question and Option Services', () => {
  let transactionContext;
  beforeEach(() => {
    jest.clearAllMocks();

    transactionContext = {
      commit: jest.fn(),
      rollback: jest.fn()
    };

    sequelize.transaction = jest.fn().mockResolvedValue(transactionContext);
    commonHelpers.throwCustomError.mockImplementation((message, statusCode) => {
      const error = new Error(message);
      error.statusCode = statusCode;
      throw error;
    });
  });

  describe('bulkCreate', () => {
    it('should create questions and options successfully', async () => {
      const currentUser = { id: 1 };
      const payload = {
        examId: 1,
        questions: [
          {
            question: 'Sample Question 1',
            type: 'multiple_choice',
            negativeMarks: 0.5,
            options: [
              { option: 'Option 1', isCorrect: true, marks: 1 },
              { option: 'Option 2', isCorrect: false, marks: 0 }
            ]
          }
        ]
      };

      Exam.findOne.mockResolvedValue({ id: 1, admin_id: 1 });
      Question.create.mockResolvedValue({ id: 1, ...payload.questions[0] });
      Option.create.mockResolvedValue(true);

      await bulkCreate(currentUser, payload);

      expect(Exam.findOne).toHaveBeenCalledWith({
        id: payload.examId,
        admin_id: currentUser.id
      });
      expect(Question.create).toHaveBeenCalledWith(
        {
          question: 'Sample Question 1',
          type: 'multiple_choice',
          negative_marks: 0.5,
          exam_id: 1
        },
        { transaction: transactionContext }
      );
      expect(Option.create).toHaveBeenCalledTimes(3);
      expect(transactionContext.commit).toHaveBeenCalled();
    });

    it('should throw an error if exam is not found', async () => {
      const currentUser = { id: 1 };
      const payload = { examId: 1, questions: [] };

      Exam.findOne.mockResolvedValue(null);

      await expect(bulkCreate(currentUser, payload)).rejects.toThrow('You can only access exams created by you');

      expect(Exam.findOne).toHaveBeenCalled();
      expect(transactionContext.rollback).toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      const currentUser = { id: 1 };
      const payload = {
        examId: 1,
        questions: [{ question: 'Sample Question', type: 'single_choice' }]
      };

      Exam.findOne.mockResolvedValue({ id: 1, admin_id: 1 });
      Question.create.mockRejectedValue(new Error('Database Error'));

      await expect(bulkCreate(currentUser, payload)).rejects.toThrow('Database Error');
      expect(transactionContext.rollback).toHaveBeenCalled();
    });
  });

  describe('createOption', () => {
    it('should create an option successfully', async () => {
      const currentUser = { id: 1 };
      const params = { id: 1 };
      const payload = { option: 'Option 1', isCorrect: true };

      questionHelpers.getQuestionExamOptions.mockResolvedValue({
        id: 1,
        type: 'multiple_choice',
        Options: []
      });
      optionServices.create.mockResolvedValue({ id: 1, ...payload });

      const result = await createOption(currentUser, params, payload);

      expect(questionHelpers.getQuestionExamOptions).toHaveBeenCalledWith(params.id, currentUser.id);
      expect(optionServices.create).toHaveBeenCalledWith(params.id, payload);
      expect(result).toEqual({ id: 1, ...payload });
    });

    it('should throw an error if question not found or no access', async () => {
      const currentUser = { id: 1 };
      const params = { id: 1 };
      const payload = { option: 'Option 1' };

      questionHelpers.getQuestionExamOptions.mockResolvedValue(null);

      await expect(createOption(currentUser, params, payload)).rejects.toThrow(
        'question not found or you do not have access to it'
      );

      expect(commonHelpers.throwCustomError).toHaveBeenCalledWith(
        'question not found or you do not have access to it',
        403
      );
    });

    it('should throw an error if single choice question already has a correct option', async () => {
      const currentUser = { id: 1 };
      const params = { id: 1 };
      const payload = { option: 'Option 2', isCorrect: true };

      questionHelpers.getQuestionExamOptions.mockResolvedValue({
        id: 1,
        type: 'single_choice',
        Options: [{ id: 1, isCorrect: true }]
      });
      questionHelpers.checkOptionsSingleChoice.mockReturnValue(false);

      await expect(createOption(currentUser, params, payload)).rejects.toThrow(
        'Single choice question can only have single option as correct'
      );

      expect(commonHelpers.throwCustomError).toHaveBeenCalledWith(
        'Single choice question can only have single option as correct',
        400
      );
    });
  });

  describe('getOption', () => {
    it('should get an option successfully', async () => {
      const currentUser = { id: 1 };
      const params = { id: 1, optionId: 2 };

      questionHelpers.getQuestionExamOptions.mockResolvedValue({
        Options: [{ id: 2, option: 'Option 1' }]
      });

      const result = await getOption(currentUser, params);

      expect(questionHelpers.getQuestionExamOptions).toHaveBeenCalledWith(params.id, currentUser.id, {
        id: params.optionId
      });
      expect(result).toEqual({ id: 2, option: 'Option 1' });
    });

    it('should throw an error if question or option not found', async () => {
      const currentUser = { id: 1 };
      const params = { id: 1, optionId: 2 };

      questionHelpers.getQuestionExamOptions.mockResolvedValue(null);

      await expect(getOption(currentUser, params)).rejects.toThrow(
        'question not found or you do not have access to it'
      );

      expect(commonHelpers.throwCustomError).toHaveBeenCalledWith(
        'question not found or you do not have access to it',
        403
      );
    });
  });

  describe('updateOption', () => {
    it('should update an option successfully', async () => {
      const currentUser = { id: 1 };
      const params = { id: 1, optionId: 2 };
      const payload = { option: 'Updated Option', isCorrect: false };

      questionHelpers.getQuestionExamOptions.mockResolvedValue({
        id: 1,
        type: 'multiple_choice',
        Options: [{ id: 2, isCorrect: true }]
      });
      optionServices.update.mockResolvedValue({ id: 2, ...payload });

      const result = await updateOption(currentUser, params, payload);

      expect(questionHelpers.getQuestionExamOptions).toHaveBeenCalledWith(params.id, currentUser.id, {
        id: params.optionId
      });
      expect(optionServices.update).toHaveBeenCalledWith(params.optionId, payload);
      expect(result).toEqual({ id: 2, ...payload });
    });

    it('should throw an error if question or option not found or no access', async () => {
      const currentUser = { id: 1 };
      const params = { id: 1, optionId: 2 };
      const payload = { option: 'Updated Option' };

      questionHelpers.getQuestionExamOptions.mockResolvedValue(null);

      await expect(updateOption(currentUser, params, payload)).rejects.toThrow(
        'question or option not found or you do not have access to it'
      );

      expect(commonHelpers.throwCustomError).toHaveBeenCalledWith(
        'question or option not found or you do not have access to it',
        403
      );
    });

    it('should throw an error if updating violates single choice constraint', async () => {
      const currentUser = { id: 1 };
      const params = { id: 1, optionId: 2 };
      const payload = { option: 'Updated Option', isCorrect: true };

      questionHelpers.getQuestionExamOptions.mockResolvedValue({
        id: 1,
        type: 'single_choice',
        Options: [
          { id: 2, isCorrect: false },
          { id: 3, isCorrect: true }
        ]
      });
      questionHelpers.checkOptionsSingleChoice.mockReturnValue(2);

      await expect(updateOption(currentUser, params, payload)).rejects.toThrow(
        'Single choice question can only have single option as correct'
      );

      expect(commonHelpers.throwCustomError).toHaveBeenCalledWith(
        'Single choice question can only have single option as correct',
        400
      );
    });
  });

  describe('removeOption', () => {
    it('should remove an option successfully', async () => {
      const currentUser = { id: 1 };
      const params = { id: 1, optionId: 2 };

      questionHelpers.getQuestionExamOptions.mockResolvedValue({
        id: 1,
        Options: [{ id: 2 }]
      });
      optionServices.remove.mockResolvedValue({ success: true });

      const result = await removeOption(currentUser, params);

      expect(questionHelpers.getQuestionExamOptions).toHaveBeenCalledWith(params.id, currentUser.id, {
        id: params.optionId
      });
      expect(optionServices.remove).toHaveBeenCalledWith(params.optionId);
      expect(result).toEqual({ success: true });
    });

    it('should throw an error if question or option not found or no access', async () => {
      const currentUser = { id: 1 };
      const params = { id: 1, optionId: 2 };

      questionHelpers.getQuestionExamOptions.mockResolvedValue(null);

      await expect(removeOption(currentUser, params)).rejects.toThrow(
        'question or option not found or you do not have access to it'
      );

      expect(commonHelpers.throwCustomError).toHaveBeenCalledWith(
        'question or option not found or you do not have access to it',
        403
      );
    });
  });
});
