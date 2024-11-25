const { createAnswer, calculateUserScore, submitExam } = require('../../src/controllers/users-exams.controller');
const commonHelpers = require('../../src/helpers/common.helper');
const userExamServices = require('../../src/services/users-exams.service');
const { getMockReq, getMockRes } = require('@jest-mock/express');
const { faker } = require('@faker-js/faker');

jest.mock('../../src/services/users-exams.service');
jest.mock('../../src/helpers/common.helper');

describe('User Exam Controllers', () => {
  let req, res, next;

  beforeEach(() => {
    req = getMockReq();
    res = getMockRes().res;
    next = getMockReq().next;
    jest.clearAllMocks();
  });

  describe('createAnswer', () => {
    it('should create an answer successfully', async () => {
      const payload = {
        answer: faker.lorem.word(),
        questionId: faker.string.uuid()
      };
      const params = { examId: faker.string.uuid() };
      req.body = payload;
      req.params = params;
      req.user = { id: faker.string.uuid() };

      const mockResponse = { id: faker.string.uuid(), ...payload };
      userExamServices.createAnswer.mockResolvedValue(mockResponse);

      await createAnswer(req, res, next);

      expect(userExamServices.createAnswer).toHaveBeenCalledWith(req.user, params, payload);
      expect(res.data).toEqual(mockResponse);
      expect(res.statusCode).toBe(201);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if createAnswer fails', async () => {
      const errorMessage = 'Error creating answer';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      userExamServices.createAnswer.mockRejectedValue(error);

      await createAnswer(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 400);
    });
  });

  describe('calculateUserScore', () => {
    it('should calculate the user score successfully', async () => {
      const params = { examId: faker.string.uuid() };
      req.params = params;
      req.user = { id: faker.string.uuid() };

      const mockResponse = { score: faker.number.int() };
      userExamServices.calculateUserScore.mockResolvedValue(mockResponse);

      await calculateUserScore(req, res, next);

      expect(userExamServices.calculateUserScore).toHaveBeenCalledWith(req.user, params);
      expect(res.data).toEqual(mockResponse);
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if calculateUserScore fails', async () => {
      const errorMessage = 'Error calculating score';
      const error = new Error(errorMessage);
      error.statusCode = 500;
      userExamServices.calculateUserScore.mockRejectedValue(error);

      await calculateUserScore(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 500);
    });
  });

  describe('submitExam', () => {
    it('should submit the exam successfully', async () => {
      const params = { examId: faker.string.uuid() };
      req.params = params;
      req.user = { id: faker.string.uuid() };

      const mockResponse = { status: 'submitted' };
      userExamServices.submitExam.mockResolvedValue(mockResponse);

      await submitExam(req, res, next);

      expect(userExamServices.submitExam).toHaveBeenCalledWith(req.user, params);
      expect(res.data).toEqual(mockResponse);
      expect(res.statusCode).toBe(202);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if submitExam fails', async () => {
      const errorMessage = 'Error submitting exam';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      userExamServices.submitExam.mockRejectedValue(error);

      await submitExam(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 400);
    });
  });
});
