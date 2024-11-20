const {
  getAll,
  get,
  update,
  remove,
  bulkCreate,
  getAllExams,
} = require('../../src/controllers/users.controller');
const userServices = require('../../src/services/users.service');
const commonHelpers = require('../../src/helpers/common.helper');
const { faker } = require('@faker-js/faker');
const { getMockReq, getMockRes } = require('@jest-mock/express');

jest.mock('../../src/services/users.service');
jest.mock('../../src/helpers/common.helper');
jest.mock('redis');

describe('User Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = getMockReq();
    res = getMockRes().res;
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should get all users successfully', async () => {
      const mockResponse = [
        { id: faker.string.uuid(), name: faker.name.fullName() },
        { id: faker.string.uuid(), name: faker.name.fullName() },
      ];
      userServices.getAll.mockResolvedValue(mockResponse);

      await getAll(req, res, next);

      expect(userServices.getAll).toHaveBeenCalledWith(req.user, undefined);
      expect(res.data).toEqual(mockResponse);
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if getAll fails', async () => {
      const errorMessage = 'Error fetching users';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      userServices.getAll.mockRejectedValue(error);

      await getAll(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(
        req,
        res,
        errorMessage,
        400,
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should get a specific user by id successfully', async () => {
      const userId = faker.string.uuid();
      req.params.id = userId;

      const mockResponse = { id: userId, name: faker.name.fullName() };
      userServices.get.mockResolvedValue(mockResponse);

      await get(req, res, next);

      expect(userServices.get).toHaveBeenCalledWith(req.user, userId);
      expect(res.data).toEqual(mockResponse);
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if get fails', async () => {
      const errorMessage = 'User not found';
      const error = new Error(errorMessage);
      error.statusCode = 404;
      userServices.get.mockRejectedValue(error);

      await get(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(
        req,
        res,
        errorMessage,
        404,
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const userId = faker.string.uuid();
      req.params.id = userId;
      req.body = { name: faker.name.fullName() };

      const mockResponse = { id: userId, ...req.body };
      userServices.update.mockResolvedValue(mockResponse);

      await update(req, res, next);

      expect(userServices.update).toHaveBeenCalledWith(
        req.user,
        userId,
        req.body,
      );
      expect(res.data).toEqual(mockResponse);
      expect(res.statusCode).toBe(202);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if update fails', async () => {
      const errorMessage = 'Error updating user';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      userServices.update.mockRejectedValue(error);

      await update(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(
        req,
        res,
        errorMessage,
        400,
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a user successfully', async () => {
      const userId = faker.string.uuid();
      req.params.id = userId;

      const mockResponse = { message: 'User deleted successfully' };
      userServices.remove.mockResolvedValue(mockResponse);

      await remove(req, res, next);

      expect(userServices.remove).toHaveBeenCalledWith(req.user, userId);
      expect(res.data).toEqual(mockResponse);
      expect(res.statusCode).toBe(202);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if remove fails', async () => {
      const errorMessage = 'Error deleting user';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      userServices.remove.mockRejectedValue(error);

      await remove(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(
        req,
        res,
        errorMessage,
        400,
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('bulkCreate', () => {
    it('should create users in bulk successfully', async () => {
      const mockUsers = [
        { id: faker.string.uuid(), name: faker.name.fullName() },
        { id: faker.string.uuid(), name: faker.name.fullName() },
      ];
      req.body = [
        { name: faker.name.fullName() },
        { name: faker.name.fullName() },
      ];
      userServices.bulkCreate.mockResolvedValue(mockUsers);

      await bulkCreate(req, res, next);

      expect(userServices.bulkCreate).toHaveBeenCalledWith(req.user, req.body);
      expect(res.data).toEqual(mockUsers);
      expect(res.statusCode).toBe(201);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if bulkCreate fails', async () => {
      const errorMessage = 'Error creating users in bulk';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      userServices.bulkCreate.mockRejectedValue(error);

      await bulkCreate(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(
        req,
        res,
        errorMessage,
        400,
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('getAllExams', () => {
    it('should get all exams successfully for a user', async () => {
      const mockExams = [
        { id: faker.string.uuid(), title: faker.lorem.words() },
        { id: faker.string.uuid(), title: faker.lorem.words() },
      ];
      req.params = { userId: faker.string.uuid() };
      userServices.getAllExams.mockResolvedValue(mockExams);

      await getAllExams(req, res, next);

      expect(userServices.getAllExams).toHaveBeenCalledWith(
        req.user,
        req.params,
      );
      expect(res.data).toEqual(mockExams);
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if getAllExams fails', async () => {
      const errorMessage = 'Error fetching exams';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      userServices.getAllExams.mockRejectedValue(error);

      await getAllExams(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(
        req,
        res,
        errorMessage,
        400,
      );
      expect(next).not.toHaveBeenCalled();
    });
  });
});
