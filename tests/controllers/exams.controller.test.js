const {
  getAll,
  create,
  get,
  update,
  remove,
  getResult,
  addUser,
  getAllUsers,
  getUser,
  removeUser,
  createQuestion,
  getAllQuestions,
  getQuestion,
  updateQuestion,
  removeQuestion,
} = require('../../src/controllers/exams.controller');
const examServices = require('../../src/services/exams.service');
const commonHelpers = require('../../src/helpers/common.helper');
const { faker } = require('@faker-js/faker');
const { getMockReq, getMockRes } = require('@jest-mock/express');

jest.mock('../../src/services/exams.service');
jest.mock('../../src/helpers/common.helper');
jest.mock('redis');

describe('Exams Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = getMockReq();
    res = getMockRes().res;
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should get all exams successfully', async () => {
      const mockExams = [
        { id: faker.string.uuid(), title: faker.lorem.words() },
        { id: faker.string.uuid(), title: faker.lorem.words() },
      ];
      req.query.page = 1;
      examServices.getAll.mockResolvedValue(mockExams);

      await getAll(req, res, next);

      expect(examServices.getAll).toHaveBeenCalledWith(req.user, { page: 1 });
      expect(res.data).toEqual(mockExams);
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if getAll fails', async () => {
      const errorMessage = 'Error fetching exams';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      examServices.getAll.mockRejectedValue(error);

      await getAll(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(
        req,
        res,
        errorMessage,
        400,
      );
    });
  });

  describe('create', () => {
    it('should create an exam successfully', async () => {
      const examData = { title: faker.lorem.words() };
      req.body = examData;

      const mockExam = { id: faker.string.uuid(), ...examData };
      examServices.create.mockResolvedValue(mockExam);

      await create(req, res, next);

      expect(examServices.create).toHaveBeenCalledWith(req.user, examData);
      expect(res.data).toEqual(mockExam);
      expect(res.statusCode).toBe(201);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if create fails', async () => {
      const errorMessage = 'Error creating exam';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      examServices.create.mockRejectedValue(error);

      await create(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(
        req,
        res,
        errorMessage,
        400,
      );
    });
  });

  describe('get', () => {
    it('should get a specific exam by id successfully', async () => {
      const examId = faker.string.uuid();
      req.params.id = examId;

      const mockExam = { id: examId, title: faker.lorem.words() };
      examServices.get.mockResolvedValue(mockExam);

      await get(req, res, next);

      expect(examServices.get).toHaveBeenCalledWith(req.user, examId);
      expect(res.data).toEqual(mockExam);
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if get fails', async () => {
      const errorMessage = 'Error fetching exam';
      const error = new Error(errorMessage);
      error.statusCode = 400;

      examServices.get.mockRejectedValue(error);

      await get(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(
        req,
        res,
        errorMessage,
        400,
      );
    });
  });

  describe('update', () => {
    it('should update an exam successfully', async () => {
      const examId = faker.string.uuid();
      req.params.id = examId;
      req.body = { title: faker.lorem.words() };

      const mockExam = { id: examId, ...req.body };
      examServices.update.mockResolvedValue(mockExam);

      await update(req, res, next);

      expect(examServices.update).toHaveBeenCalledWith(
        req.user,
        examId,
        req.body,
      );
      expect(res.data).toEqual(mockExam);
      expect(res.statusCode).toBe(202);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if update fails', async () => {
      const errorMessage = 'Error updating exam';
      const error = new Error(errorMessage);
      error.statusCode = 400;

      examServices.update.mockRejectedValue(error);

      await update(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(
        req,
        res,
        errorMessage,
        400,
      );
    });
  });

  describe('remove', () => {
    it('should remove an exam successfully', async () => {
      const examId = faker.string.uuid();
      req.params.id = examId;

      const mockResponse = { message: 'Exam deleted successfully' };
      examServices.remove.mockResolvedValue(mockResponse);

      await remove(req, res, next);

      expect(examServices.remove).toHaveBeenCalledWith(req.user, examId);
      expect(res.data).toEqual(mockResponse);
      expect(res.statusCode).toBe(202);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if remove fails', async () => {
      const errorMessage = 'Error deleting exam';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      examServices.remove.mockRejectedValue(error);

      await remove(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(
        req,
        res,
        errorMessage,
        400,
      );
    });
  });

  describe('getResult', () => {
    it('should get exam result successfully', async () => {
      const examId = faker.string.uuid();
      req.params.id = examId;

      const mockResult = { score: 90, status: 'Passed' };
      examServices.getResult.mockResolvedValue(mockResult);

      await getResult(req, res, next);

      expect(examServices.getResult).toHaveBeenCalledWith(req.user, examId);
      expect(res.data).toEqual(mockResult);
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if getResult fails', async () => {
      const errorMessage = 'Error fetching result';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      examServices.getResult.mockRejectedValue(error);

      await getResult(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(
        req,
        res,
        errorMessage,
        400,
      );
    });
  });

  describe('addUser', () => {
    it('should add a user to an exam successfully', async () => {
      const examId = faker.string.uuid();
      req.params.id = examId;
      req.body = { userId: faker.string.uuid() };

      const mockResponse = { message: 'User added to exam' };
      examServices.addUser.mockResolvedValue(mockResponse);

      await addUser(req, res, next);

      expect(examServices.addUser).toHaveBeenCalledWith(
        req.user,
        examId,
        req.body,
      );
      expect(res.data).toEqual(mockResponse);
      expect(res.statusCode).toBe(201);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if addUser fails', async () => {
      const errorMessage = 'Error adding user to exam';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      examServices.addUser.mockRejectedValue(error);

      await addUser(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(
        req,
        res,
        errorMessage,
        400,
      );
    });
  });

  describe('getAllUsers', () => {
    it('should get all users for an exam successfully', async () => {
      const examId = faker.string.uuid();
      req.params.id = examId;
      req.query.page = 1;

      const mockUsers = [
        { id: faker.string.uuid(), name: faker.person.fullName() },
        { id: faker.string.uuid(), name: faker.person.fullName() },
      ];
      examServices.getAllUsers.mockResolvedValue(mockUsers);

      await getAllUsers(req, res, next);

      expect(examServices.getAllUsers).toHaveBeenCalledWith(
        req.user,
        examId,
        req.query,
      );
      expect(res.data).toEqual(mockUsers);
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if getAllUsers fails', async () => {
      const errorMessage = 'Error fetching users for exam';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      examServices.getAllUsers.mockRejectedValue(error);

      await getAllUsers(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(
        req,
        res,
        errorMessage,
        400,
      );
    });
  });

  describe('getUser', () => {
    it('should get a specific user for an exam successfully', async () => {
      const examId = faker.string.uuid();
      const userId = faker.string.uuid();
      req.params.id = examId;
      req.params.userId = userId;

      const mockUser = { id: userId, name: faker.person.fullName() };
      examServices.getUser.mockResolvedValue(mockUser);

      await getUser(req, res, next);

      expect(examServices.getUser).toHaveBeenCalledWith(
        req.user,
        userId,
        examId,
      );
      expect(res.data).toEqual(mockUser);
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if getUser fails', async () => {
      const errorMessage = 'Error fetching user for exam';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      examServices.getUser.mockRejectedValue(error);

      await getUser(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(
        req,
        res,
        errorMessage,
        400,
      );
    });
  });

  describe('removeUser', () => {
    it('should remove a user from an exam successfully', async () => {
      const examId = faker.string.uuid();
      const userId = faker.string.uuid();
      req.params.id = examId;
      req.params.userId = userId;

      const mockResponse = { message: 'User removed from exam' };
      examServices.removeUser.mockResolvedValue(mockResponse);

      await removeUser(req, res, next);

      expect(examServices.removeUser).toHaveBeenCalledWith(
        req.user,
        userId,
        examId,
      );
      expect(res.data).toEqual(mockResponse);
      expect(res.statusCode).toBe(202);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if removeUser fails', async () => {
      const errorMessage = 'Error removing user from exam';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      examServices.removeUser.mockRejectedValue(error);

      await removeUser(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(
        req,
        res,
        errorMessage,
        400,
      );
    });
  });

  describe('createQuestion', () => {
    it('should create a question for an exam successfully', async () => {
      const examId = faker.string.uuid();
      req.params.id = examId;
      req.body = { question: faker.lorem.sentence() };

      const mockQuestion = { id: faker.string.uuid(), ...req.body };
      examServices.createQuestion.mockResolvedValue(mockQuestion);

      await createQuestion(req, res, next);

      expect(examServices.createQuestion).toHaveBeenCalledWith(
        req.user,
        examId,
        req.body,
      );
      expect(res.data).toEqual(mockQuestion);
      expect(res.statusCode).toBe(201);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if createQuestion fails', async () => {
      const errorMessage = 'Error creating question';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      examServices.createQuestion.mockRejectedValue(error);

      await createQuestion(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(
        req,
        res,
        errorMessage,
        400,
      );
    });
  });

  describe('getAllQuestions', () => {
    it('should get all questions for an exam successfully', async () => {
      const examId = faker.string.uuid();
      req.params.id = examId;
      req.query.page = 1;

      const mockQuestions = [
        { id: faker.string.uuid(), question: faker.lorem.sentence() },
        { id: faker.string.uuid(), question: faker.lorem.sentence() },
      ];
      examServices.getAllQuestions.mockResolvedValue(mockQuestions);

      await getAllQuestions(req, res, next);

      expect(examServices.getAllQuestions).toHaveBeenCalledWith(
        req.user,
        examId,
        req.query,
      );
      expect(res.data).toEqual(mockQuestions);
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if getAllQuestions fails', async () => {
      const errorMessage = 'Error fetching questions for exam';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      examServices.getAllQuestions.mockRejectedValue(error);

      await getAllQuestions(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(
        req,
        res,
        errorMessage,
        400,
      );
    });
  });

  describe('getQuestion', () => {
    it('should get a specific question from an exam successfully', async () => {
      const examId = faker.string.uuid();
      const questionId = faker.string.uuid();
      req.params.id = examId;
      req.params.questionId = questionId;

      const mockQuestion = { id: questionId, question: faker.lorem.sentence() };
      examServices.getQuestion.mockResolvedValue(mockQuestion);

      await getQuestion(req, res, next);

      expect(examServices.getQuestion).toHaveBeenCalledWith(
        req.user,
        examId,
        questionId,
      );
      expect(res.data).toEqual(mockQuestion);
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if getQuestion fails', async () => {
      const errorMessage = 'Error fetching question';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      examServices.getQuestion.mockRejectedValue(error);

      await getQuestion(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(
        req,
        res,
        errorMessage,
        400,
      );
    });
  });

  describe('updateQuestion', () => {
    it('should update a question in an exam successfully', async () => {
      const examId = faker.string.uuid();
      const questionId = faker.string.uuid();
      req.params.id = examId;
      req.params.questionId = questionId;
      req.body = { question: faker.lorem.sentence() };

      const mockUpdatedQuestion = { id: questionId, ...req.body };
      examServices.updateQuestion.mockResolvedValue(mockUpdatedQuestion);

      await updateQuestion(req, res, next);

      expect(examServices.updateQuestion).toHaveBeenCalledWith(
        req.user,
        examId,
        questionId,
        req.body,
      );
      expect(res.data).toEqual(mockUpdatedQuestion);
      expect(res.statusCode).toBe(202);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if updateQuestion fails', async () => {
      const errorMessage = 'Error updating question';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      examServices.updateQuestion.mockRejectedValue(error);

      await updateQuestion(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(
        req,
        res,
        errorMessage,
        400,
      );
    });
  });

  describe('removeQuestion', () => {
    it('should remove a question from an exam successfully', async () => {
      const examId = faker.string.uuid();
      const questionId = faker.string.uuid();
      req.params.id = examId;
      req.params.questionId = questionId;

      const mockResponse = { message: 'Question removed from exam' };
      examServices.removeQuestion.mockResolvedValue(mockResponse);

      await removeQuestion(req, res, next);

      expect(examServices.removeQuestion).toHaveBeenCalledWith(
        req.user,
        examId,
        questionId,
      );
      expect(res.data).toEqual(mockResponse);
      expect(res.statusCode).toBe(202);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if removeQuestion fails', async () => {
      const errorMessage = 'Error removing question';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      examServices.removeQuestion.mockRejectedValue(error);

      await removeQuestion(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(
        req,
        res,
        errorMessage,
        400,
      );
    });
  });
});
