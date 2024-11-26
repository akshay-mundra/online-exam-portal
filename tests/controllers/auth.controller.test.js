const { login, register, forgotPassword, resetPassword, logout } = require('../../src/controllers/auth.controller');
const authServices = require('../../src/services/auth.service');
const commonHelpers = require('../../src/helpers/common.helper');
const { getMockReq, getMockRes } = require('@jest-mock/express');
const { redisClient } = require('../../src/config/redis');

jest.mock('../../src/services/auth.service');
jest.mock('../../src/helpers/common.helper');
jest.mock('redis', () => {
  const mRedisClient = {
    connect: jest.fn().mockResolvedValue(),
    on: jest.fn(),
    quit: jest.fn().mockResolvedValue()
  };
  return {
    createClient: jest.fn(() => mRedisClient)
  };
});

describe('Auth Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = getMockReq();
    res = getMockRes().res;
    next = getMockRes().next;
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await redisClient.quit();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockUser = { id: 1, username: 'user1' };
      authServices.login.mockResolvedValue(mockUser);
      req.body = { username: 'user1', password: 'password' };

      await login(req, res, next);

      expect(authServices.login).toHaveBeenCalledWith(req.body);
      expect(res.data).toEqual(mockUser);
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if login fails', async () => {
      const errorMessage = 'Invalid credentials';
      const err = new Error(errorMessage);
      err.statusCode = 401;
      authServices.login.mockRejectedValue(err);
      req.body = { username: 'user1', password: 'wrongpassword' };

      await login(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const mockUser = { id: 1, username: 'newUser' };
      authServices.register.mockResolvedValue(mockUser);
      req.body = { username: 'newUser', password: 'password' };

      await register(req, res, next);

      expect(authServices.register).toHaveBeenCalledWith(req.user, req.body);
      expect(res.data).toEqual(mockUser);
      expect(res.statusCode).toBe(201);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if registration fails', async () => {
      const errorMessage = 'Email already taken';
      const err = new Error(errorMessage);
      err.statusCode = 409;
      authServices.register.mockRejectedValue(err);
      req.body = { username: 'existingUser', password: 'password' };

      await register(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 409);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    it('should handle forgot password request successfully', async () => {
      const successMessage = 'Password reset link sent';
      authServices.forgotPassword.mockResolvedValue(successMessage);
      req.body = { email: 'user1@example.com' };

      await forgotPassword(req, res, next);

      expect(authServices.forgotPassword).toHaveBeenCalledWith(req.body);
      expect(res.data).toEqual(successMessage);
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if forgot password fails', async () => {
      const errorMessage = 'Email not found';
      const err = new Error(errorMessage);
      err.statusCode = 400;
      authServices.forgotPassword.mockRejectedValue(err);
      req.body = { email: 'user2@example.com' };

      await forgotPassword(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 400);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const successMessage = 'Password reset successfully';
      authServices.resetPassword.mockResolvedValue(successMessage);
      req.body = { token: 'valid_token', newPassword: 'newpassword' };

      await resetPassword(req, res, next);

      expect(authServices.resetPassword).toHaveBeenCalledWith(req.body);
      expect(res.data).toEqual(successMessage);
      expect(res.statusCode).toBe(202);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if reset password fails', async () => {
      const errorMessage = 'Invalid token';

      const err = new Error(errorMessage);
      err.statusCode = 401;

      authServices.resetPassword.mockRejectedValue(err);
      req.body = { token: 'invalid_token', newPassword: 'newpassword' };

      await resetPassword(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should log out successfully', async () => {
      const successMessage = 'Logged out successfully';
      authServices.logout.mockResolvedValue(successMessage);

      await logout(req, res, next);

      expect(authServices.logout).toHaveBeenCalled();
      expect(res.data).toEqual(successMessage);
      expect(res.statusCode).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors if logout fails', async () => {
      const errorMessage = 'Failed to log out';
      const err = new Error(errorMessage);
      err.statusCode = 401;
      authServices.logout.mockRejectedValue(err);

      await logout(req, res, next);

      expect(commonHelpers.errorHandler).toHaveBeenCalledWith(req, res, errorMessage, 401);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
