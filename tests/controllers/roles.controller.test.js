const { create, getAll, get, update, remove } = require('../../src/controllers/roles.controller');
const roleServices = require('../../src/services/roles.service');
const commonHelpers = require('../../src/helpers/common.helper');
const { faker } = require('@faker-js/faker');
const { getMockReq, getMockRes } = require('@jest-mock/express');

jest.mock('../../src/services/roles.service');
jest.mock('../../src/helpers/common.helper');

describe('Roles Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = getMockReq();
    res = getMockRes().res;
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new role successfully', async () => {
      const payload = { name: faker.lorem.word() };
      req.body = payload;

      const mockResponse = { id: faker.string.uuid(), ...payload };
      roleServices.create.mockResolvedValue(mockResponse);

      await create(req, res, next);

      expect(roleServices.create).toHaveBeenCalledWith(payload);
      expect(res.data).toEqual(mockResponse);
      expect(res.statusCode).toBe(201);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if create fails', async () => {
      const errorMessage = 'Error creating role';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      roleServices.create.mockRejectedValue(error);

      await create(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 400);
    });
  });

  describe('getAll', () => {
    it('should get all roles successfully', async () => {
      const mockResponse = [
        { id: faker.string.uuid(), name: faker.lorem.word() },
        { id: faker.string.uuid(), name: faker.lorem.word() }
      ];
      roleServices.getAll.mockResolvedValue(mockResponse);

      await getAll(req, res, next);

      expect(roleServices.getAll).toHaveBeenCalled();
      expect(res.data).toEqual(mockResponse);
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if getAll fails', async () => {
      const errorMessage = 'Error fetching roles';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      roleServices.getAll.mockRejectedValue(error);

      await getAll(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 400);
    });
  });

  describe('get', () => {
    it('should get a specific role by id successfully', async () => {
      const roleId = faker.string.uuid();
      req.params.id = roleId;

      const mockResponse = { id: roleId, name: faker.lorem.word() };
      roleServices.get.mockResolvedValue(mockResponse);

      await get(req, res, next);

      expect(roleServices.get).toHaveBeenCalledWith({ id: roleId });
      expect(res.data).toEqual(mockResponse);
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if get fails', async () => {
      const errorMessage = 'Error fetching role';
      const error = new Error(errorMessage);
      error.statusCode = 400;

      roleServices.get.mockRejectedValue(error);

      await get(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 400);
    });
  });

  describe('update', () => {
    it('should update a role successfully', async () => {
      const roleId = faker.string.uuid();
      req.params.id = roleId;
      req.body = { name: faker.lorem.word() };

      const mockResponse = { id: roleId, ...req.body };
      roleServices.update.mockResolvedValue(mockResponse);

      await update(req, res, next);

      expect(roleServices.update).toHaveBeenCalledWith({ id: roleId }, req.body);
      expect(res.data).toEqual(mockResponse);
      expect(res.statusCode).toBe(202);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if update fails', async () => {
      const errorMessage = 'Error updating role';
      const error = new Error(errorMessage);
      error.statusCode = 400;

      roleServices.update.mockRejectedValue(error);

      await update(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 400);
    });
  });

  describe('remove', () => {
    it('should remove a role successfully', async () => {
      const roleId = faker.string.uuid();
      req.params.id = roleId;

      const mockResponse = { id: roleId, message: 'Role deleted successfully' };
      roleServices.remove.mockResolvedValue(mockResponse);

      await remove(req, res, next);

      expect(roleServices.remove).toHaveBeenCalledWith({ id: roleId });
      expect(res.data).toEqual(mockResponse);
      expect(res.statusCode).toBe(202);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if remove fails', async () => {
      const errorMessage = 'Error deleting role';
      const error = new Error(errorMessage);
      error.statusCode = 400;
      roleServices.remove.mockRejectedValue(error);

      await remove(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 400);
    });
  });
});
