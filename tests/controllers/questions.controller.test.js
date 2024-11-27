const {
  bulkCreate,
  createOption,
  getOption,
  updateOption,
  removeOption
} = require('../../src/controllers/questions.controller');
const questionServices = require('../../src/services/questions.service');
const commonHelpers = require('../../src/helpers/common.helper');
const { faker } = require('@faker-js/faker');
const { getMockReq, getMockRes } = require('@jest-mock/express');

jest.mock('../../src/services/questions.service');
jest.mock('../../src/helpers/common.helper');

describe('Questions Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = getMockReq();
    res = getMockRes().res;
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('bulkCreate', () => {
    it('should create multiple questions successfully', async () => {
      const payload = [
        { question: faker.lorem.sentence(), options: [faker.lorem.word()] },
        { question: faker.lorem.sentence(), options: [faker.lorem.word()] }
      ];
      req.body = payload;
      const mockResponse = [
        { id: faker.string.uuid(), ...payload[0] },
        { id: faker.string.uuid(), ...payload[1] }
      ];
      questionServices.bulkCreate.mockResolvedValue(mockResponse);

      await bulkCreate(req, res, next);

      expect(questionServices.bulkCreate).toHaveBeenCalledWith(req.user, payload);
      expect(res.data).toEqual(mockResponse);
      expect(res.statusCode).toBe(201);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if bulkCreate fails', async () => {
      const errorMessage = 'Error creating questions';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      questionServices.bulkCreate.mockRejectedValue(error);

      await bulkCreate(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 400);
    });
  });

  describe('createOption', () => {
    it('should create an option for a question successfully', async () => {
      const payload = { optionText: faker.lorem.word(), isCorrect: true };
      const params = { questionId: faker.string.uuid() };
      req.body = payload;
      req.params = params;
      req.user = { id: faker.string.uuid() };

      const mockResponse = { id: faker.string.uuid(), ...payload };
      questionServices.createOption.mockResolvedValue(mockResponse);

      await createOption(req, res, next);

      expect(questionServices.createOption).toHaveBeenCalledWith(req.user, params, payload);
      expect(res.data).toEqual(mockResponse);
      expect(res.statusCode).toBe(201);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if createOption fails', async () => {
      const errorMessage = 'Error creating option';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      questionServices.createOption.mockRejectedValue(error);

      await createOption(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 400);
    });
  });

  describe('getOption', () => {
    it('should get a specific option for a question successfully', async () => {
      const params = {
        questionId: faker.string.uuid(),
        optionId: faker.string.uuid()
      };
      req.params = params;
      req.user = { id: faker.string.uuid() };

      const mockResponse = { id: params.optionId, text: faker.lorem.word() };
      questionServices.getOption.mockResolvedValue(mockResponse);

      await getOption(req, res, next);

      expect(questionServices.getOption).toHaveBeenCalledWith(req.user, params);
      expect(res.data).toEqual(mockResponse);
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if getOption fails', async () => {
      const errorMessage = 'Error fetching option';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      questionServices.getOption.mockRejectedValue(error);

      await getOption(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 400);
    });
  });

  describe('updateOption', () => {
    it('should update an option for a question successfully', async () => {
      const params = {
        questionId: faker.string.uuid(),
        optionId: faker.string.uuid()
      };
      const payload = { optionText: faker.lorem.word(), isCorrect: true };
      req.params = params;
      req.body = payload;
      req.user = { id: faker.string.uuid() };

      const mockResponse = { id: params.optionId, ...payload };
      questionServices.updateOption.mockResolvedValue(mockResponse);

      await updateOption(req, res, next);

      expect(questionServices.updateOption).toHaveBeenCalledWith(req.user, params, payload);
      expect(res.data).toEqual(mockResponse);
      expect(res.statusCode).toBe(202);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if updateOption fails', async () => {
      const errorMessage = 'Error updating option';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      questionServices.updateOption.mockRejectedValue(error);

      await updateOption(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 400);
    });
  });

  describe('removeOption', () => {
    it('should remove an option for a question successfully', async () => {
      const params = {
        questionId: faker.string.uuid(),
        optionId: faker.string.uuid()
      };
      req.params = params;
      req.user = { id: faker.string.uuid() };

      const mockResponse = {
        id: params.optionId,
        message: 'Option deleted successfully'
      };
      questionServices.removeOption.mockResolvedValue(mockResponse);

      await removeOption(req, res, next);

      expect(questionServices.removeOption).toHaveBeenCalledWith(req.user, params);
      expect(res.data).toEqual(mockResponse);
      expect(res.statusCode).toBe(204);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if removeOption fails', async () => {
      const errorMessage = 'Error deleting option';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      questionServices.removeOption.mockRejectedValue(error);

      await removeOption(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 400);
    });
  });
});
