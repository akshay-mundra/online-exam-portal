const { create, update, remove } = require('../../src/services/options.service');
const { Option } = require('../../src/models');
const commonHelpers = require('../../src/helpers/common.helper');
const { sequelize } = require('../../src/models');

jest.mock('../../src/models');
jest.mock('../../src/helpers/common.helper');

describe('Option Service', () => {
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

  describe('create', () => {
    it('should create an option successfully', async () => {
      const questionId = '123';
      const payload = { option: 'Option A', isCorrect: true, marks: 5 };
      Option.create.mockResolvedValue({
        id: '1',
        ...payload,
        question_id: questionId
      });

      const result = await create(questionId, payload);

      expect(Option.create).toHaveBeenCalledWith({
        option: 'Option A',
        is_correct: true,
        marks: 5,
        question_id: questionId
      });

      expect(result).toEqual({ id: '1', ...payload, question_id: questionId });
    });

    it('should rollback transaction on error during option creation', async () => {
      const questionId = '123';
      const payload = { option: 'Option A', isCorrect: true, marks: 5 };
      Option.create.mockRejectedValue(new Error('Database Error'));

      await expect(create(questionId, payload)).rejects.toThrow('Database Error');
    });
  });

  describe('update', () => {
    it('should update an option successfully', async () => {
      const id = '1';
      const payload = { option: 'Updated Option', isCorrect: false, marks: 10 };
      Option.update.mockResolvedValue([1, [{ id, ...payload }]]);

      const result = await update(id, payload);

      expect(Option.update).toHaveBeenCalledWith(
        {
          option: 'Updated Option',
          is_correct: false,
          marks: 10
        },
        {
          where: { id },
          returning: true
        }
      );
      expect(result).toEqual([{ id, ...payload }]);
    });

    it('should throw error if option is not found', async () => {
      const id = '1';
      const payload = { option: 'Updated Option', isCorrect: false, marks: 10 };
      Option.update.mockResolvedValue([0]);

      await expect(update(id, payload)).rejects.toThrow('Option not found');

      expect(commonHelpers.throwCustomError).toHaveBeenCalledWith('Option not found', 404);
    });

    it('should rollback transaction on error during update', async () => {
      const id = '1';
      const payload = { option: 'Updated Option', isCorrect: false, marks: 10 };
      Option.update.mockRejectedValue(new Error('Database Error'));

      await expect(update(id, payload)).rejects.toThrow('Database Error');
    });
  });

  describe('remove', () => {
    it('should remove an option successfully', async () => {
      const id = '1';
      Option.destroy.mockResolvedValue(1);

      const result = await remove(id);

      expect(Option.destroy).toHaveBeenCalledWith({ where: { id } });

      expect(result).toBe('Option deleted successfully');
    });

    it('should throw error if option to be removed is not found', async () => {
      const id = '1';
      Option.destroy.mockResolvedValue(0);

      await expect(remove(id)).rejects.toThrow('Option not found');

      expect(commonHelpers.throwCustomError).toHaveBeenCalledWith('Option not found', 404);
    });

    it('should rollback transaction on error during removal', async () => {
      const id = '1';
      Option.destroy.mockRejectedValue(new Error('Database Error'));

      await expect(remove(id)).rejects.toThrow('Database Error');
    });
  });
});
