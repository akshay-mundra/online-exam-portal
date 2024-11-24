const {
  throwCustomError,
  errorHandler,
  responseHandler,
  getRolesAsBool,
  getPaginationAttributes,
} = require('../../src/helpers/common.helper');
const { SUPER_ADMIN, ADMIN, USER } =
  require('../../src/constants/common.constant').roles;

jest.mock('express', () => ({
  response: {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  },
}));

describe('Helper Functions', () => {
  describe('throwCustomError', () => {
    it('should throw a custom error with message and status code', () => {
      const message = 'Something went wrong';
      const statusCode = 404;
      const isCustom = false;

      try {
        throwCustomError(message, statusCode, isCustom);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe(message);
        expect(error.statusCode).toBe(statusCode);
      }
    });

    it('should return a custom error without throwing if isCustom is true', () => {
      const message = 'Custom error';
      const statusCode = 500;
      const isCustom = true;

      const error = throwCustomError(message, statusCode, isCustom);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(statusCode);
    });
  });

  describe('errorHandler', () => {
    it('should send a response with the default message and status code', () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      errorHandler({}, res, null);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Something went wrong',
      });
    });

    it('should send a response with a custom message and status code', () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      errorHandler({}, res, 'Custom error message', 404);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Custom error message',
      });
    });
  });

  describe('responseHandler', () => {
    it('should send a response with the provided data and status code', () => {
      const res = {
        statusCode: 200,
        data: { id: 1, name: 'John Doe' },
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      responseHandler({}, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: res.data });
    });
  });

  describe('getRolesAsBool', () => {
    it('should return correct role booleans for SUPER_ADMIN', () => {
      const roles = [SUPER_ADMIN];
      const result = getRolesAsBool(roles);
      expect(result.isSuperAdmin).toBe(true);
      expect(result.isAdmin).toBe(false);
      expect(result.isUser).toBe(false);
    });

    it('should return correct role booleans for ADMIN', () => {
      const roles = [ADMIN];
      const result = getRolesAsBool(roles);
      expect(result.isSuperAdmin).toBe(false);
      expect(result.isAdmin).toBe(true);
      expect(result.isUser).toBe(false);
    });

    it('should return correct role booleans for USER', () => {
      const roles = [USER];
      const result = getRolesAsBool(roles);
      expect(result.isSuperAdmin).toBe(false);
      expect(result.isAdmin).toBe(false);
      expect(result.isUser).toBe(true);
    });

    it('should return all false if no roles match', () => {
      const roles = ['GUEST'];
      const result = getRolesAsBool(roles);
      expect(result.isSuperAdmin).toBe(false);
      expect(result.isAdmin).toBe(false);
      expect(result.isUser).toBe(false);
    });

    it('should handle undefined or null roles gracefully', () => {
      expect(getRolesAsBool()).toEqual({
        isSuperAdmin: false,
        isAdmin: false,
        isUser: false,
      });
    });
  });

  describe('getPaginationAttributes', () => {
    it('should return correct pagination attributes for default values', () => {
      const result = getPaginationAttributes();
      expect(result).toEqual({ limit: 10, offset: 0 });
    });

    it('should return correct pagination attributes for custom values', () => {
      const result = getPaginationAttributes(2, 20);
      expect(result).toEqual({ limit: 20, offset: 40 });
    });

    it('should handle edge case where page is zero', () => {
      const result = getPaginationAttributes(0, 10);
      expect(result).toEqual({ limit: 10, offset: 0 });
    });

    it('should handle large values for page and limit', () => {
      const result = getPaginationAttributes(1000, 1000);
      expect(result).toEqual({ limit: 1000, offset: 1000000 });
    });
  });
});
