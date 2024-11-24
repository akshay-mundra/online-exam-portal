const { User, Role, UserRole } = require('../../src/models');
const bcrypt = require('bcrypt');
const jwtHelpers = require('../../src/helpers/jwt.helper');
const nodemailerHelpers = require('../../src/helpers/nodemailer.helper');
const { sequelize } = require('../../src/models');
const commonHelpers = require('../../src/helpers/common.helper');
const {
  login,
  register,
  forgotPassword,
  resetPassword,
} = require('../../src/services/auth.service');
const { faker } = require('@faker-js/faker');
const { redisClient } = require('../../src/config/redis');

jest.mock('../../src/models');
jest.mock('../../src/helpers/jwt.helper');
jest.mock('../../src/helpers/nodemailer.helper');
jest.mock('../../src/helpers/common.helper');
jest.mock('bcrypt');
jest.mock('redis');
jest.mock('../../src/config/redis', () => ({
  redisClient: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  },
}));

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should log in a user successfully with valid credentials', async () => {
      const email = faker.internet.email();
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      const mockUser = {
        id: faker.string.uuid(),
        email,
        password: hashedPassword,
        Roles: [{ name: 'user' }],
      };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      const mockToken = 'jwt-token';
      jwtHelpers.signToken.mockReturnValue(mockToken);

      await login({ email, password });

      expect(User.findOne).toHaveBeenCalledWith({
        where: { email },
        include: expect.any(Array),
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
      expect(jwtHelpers.signToken).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        roles: ['user'],
      });
    });

    it('should throw an error if user does not exist', async () => {
      const email = faker.internet.email();
      const password = 'password123';

      User.findOne.mockResolvedValue(null);

      await login({ email, password });

      expect(User.findOne).toHaveBeenCalled();

      const errMessage = 'User with email does not exist';

      expect(commonHelpers.throwCustomError).toHaveBeenCalledWith(
        errMessage,
        401,
      );
    });

    it('should throw an error for invalid password', async () => {
      const email = faker.internet.email();
      const password = 'password123';
      const mockUser = {
        id: faker.string.uuid(),
        email,
        password: 'hashed-password',
        Roles: [{ name: 'user' }],
      };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await login({ email, password });

      expect(User.findOne).toHaveBeenCalled();

      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);

      const errMessage = 'Invalid email or password';

      expect(commonHelpers.throwCustomError).toHaveBeenCalledWith(
        errMessage,
        403,
      );
    });
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      const req = { user: { roles: ['admin'] } };
      const payload = {
        firstName: 'John',
        lastName: 'Doe',
        email: faker.internet.email(),
        password: 'password123',
        roles: ['user'],
      };
      const mockRole = { id: faker.string.uuid(), name: 'user' };
      Role.findAll.mockResolvedValue([mockRole]);
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({ id: faker.string.uuid() });
      UserRole.bulkCreate.mockResolvedValue([]);
      sequelize.transaction.mockReturnValue({
        commit: jest.fn(),
        rollback: jest.fn(),
      });

      const result = await register(req, payload);

      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: payload.email },
      });
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: payload.email }),
        { transaction: expect.any(Object) },
      );
      expect(result).toBeDefined();
    });

    it('should handle registration when user already exists', async () => {
      const payload = { email: faker.internet.email(), roles: ['user'] };
      User.findOne.mockResolvedValue({ id: faker.string.uuid() });

      await register({}, payload);

      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: payload.email },
      });

      expect(commonHelpers.throwCustomError).toHaveBeenCalledWith(
        'User already exists',
        409,
      );
    });
  });

  describe('forgotPassword', () => {
    it('should generate and send a reset password token', async () => {
      const email = faker.internet.email();
      const user = { id: faker.string.uuid(), email };
      User.findOne.mockResolvedValue(user);
      redisClient.get.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedResetToken');

      const result = await forgotPassword({ email });

      expect(User.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(redisClient.set).toHaveBeenCalledWith(
        `reset-token:${user.id}`,
        'hashedResetToken',
        'EX',
        60,
      );
      expect(nodemailerHelpers.sendEmail).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Password reset link sent to email',
      });
    });

    it('should throw an error if user does not exist', async () => {
      const email = faker.internet.email();
      User.findOne.mockResolvedValue(null);

      await forgotPassword({ email });

      expect(User.findOne).toHaveBeenCalledWith({ where: { email } });

      expect(commonHelpers.throwCustomError).toHaveBeenCalledWith(
        'User does not exist',
        401,
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset the password successfully', async () => {
      const payload = {
        password: 'newPassword123',
        confirmPassword: 'newPassword123',
        token: 'resetToken',
        userId: faker.string.uuid(),
      };
      const user = { id: payload.userId, save: jest.fn() };
      User.findOne.mockResolvedValue(user);
      redisClient.get.mockResolvedValue('hashedResetToken');
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('newHashedPassword');
      sequelize.transaction.mockReturnValue({
        commit: jest.fn(),
        rollback: jest.fn(),
      });

      const result = await resetPassword(payload);

      expect(User.findOne).toHaveBeenCalledWith({
        where: { id: payload.userId },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        payload.token,
        'hashedResetToken',
      );
      expect(user.save).toHaveBeenCalled();
      expect(result).toBe('Password reset successful');
    });

    it('should throw an error if passwords do not match', async () => {
      const payload = {
        password: 'password123',
        confirmPassword: 'differentPassword',
        token: 'resetToken',
        userId: faker.string.uuid(),
      };

      await resetPassword(payload);

      expect(commonHelpers.throwCustomError).toHaveBeenCalledWith(
        'Both passwords should match',
        422,
      );
    });
  });
});
