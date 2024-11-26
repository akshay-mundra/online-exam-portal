const service = require('../../src/services/users.service');
const { User, Role, UserRole, Exam, UserExam, sequelize } = require('../../src/models');
const commonHelpers = require('../../src/helpers/common.helper');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const moment = require('moment');

jest.mock('../../src/models');
jest.mock('../../src/helpers/common.helper');
jest.mock('bcrypt');

describe('Service Layer Unit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all users for superadmin', async () => {
      const currentUser = { roles: ['superadmin'] };
      const query = { limit: 10, page: 1 };

      commonHelpers.getPaginationAttributes.mockReturnValue({ limit: 10, offset: 0 });
      commonHelpers.getRolesAsBool.mockReturnValue({ isSuperAdmin: true });
      User.findAndCountAll.mockResolvedValue({ count: 2, rows: [{ id: 1 }, { id: 2 }] });

      const result = await service.getAll(currentUser, query);

      expect(result).toEqual({ users: [{ id: 1 }, { id: 2 }], total: 2 });
      expect(User.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        attributes: ['id', 'first_name', 'last_name', 'email', 'admin_id'],
        offset: 0,
        limit: 10
      });
    });

    it('should return users created by the admin', async () => {
      const currentUser = { id: 1, roles: ['admin'] };
      const query = { limit: 5, page: 2 };

      commonHelpers.getPaginationAttributes.mockReturnValue({ limit: 5, offset: 5 });
      commonHelpers.getRolesAsBool.mockReturnValue({ isSuperAdmin: false });
      User.findAndCountAll.mockResolvedValue({ count: 1, rows: [{ id: 3 }] });

      const result = await service.getAll(currentUser, query);

      expect(result).toEqual({ users: [{ id: 3 }], total: 1 });
      expect(User.findAndCountAll).toHaveBeenCalledWith({
        where: { admin_id: 1 },
        attributes: ['id', 'first_name', 'last_name', 'email', 'admin_id'],
        offset: 5,
        limit: 5
      });
    });
  });

  describe('getMe', () => {
    it('should return the current user', async () => {
      const currentUser = { id: 1 };

      User.findByPk.mockResolvedValue({ id: 1, firstName: 'John' });

      const result = await service.getMe(currentUser);

      expect(result).toEqual({ id: 1, firstName: 'John' });
      expect(User.findByPk).toHaveBeenCalledWith(1);
    });

    it('should throw an error if the user is not found', async () => {
      const currentUser = { id: 1 };

      User.findByPk.mockResolvedValue(null);
      commonHelpers.throwCustomError.mockImplementation((msg, status) => {
        throw { message: msg, status };
      });

      await expect(service.getMe(currentUser)).rejects.toEqual({
        message: 'User not found',
        status: 404
      });

      expect(User.findByPk).toHaveBeenCalledWith(1);
    });
  });

  describe('get', () => {
    it('should return the user if accessible by super admin', async () => {
      const currentUser = { roles: ['super_admin'] };
      const userId = 1;

      commonHelpers.getRolesAsBool.mockReturnValue({ isSuperAdmin: true, isUser: false, isAdmin: false });
      User.findOne.mockResolvedValue({ id: userId, name: 'John Doe' });

      const result = await service.get(currentUser, userId);

      expect(result).toEqual({ id: userId, name: 'John Doe' });
      expect(User.findOne).toHaveBeenCalledWith({ where: { id: userId } });
    });

    it('should return the user if accessible by an admin', async () => {
      const currentUser = { id: 2, roles: ['admin'] };
      const userId = 3;

      commonHelpers.getRolesAsBool.mockReturnValue({ isSuperAdmin: false, isUser: false, isAdmin: true });
      User.findOne.mockResolvedValue({ id: userId, name: 'Jane Doe' });

      const result = await service.get(currentUser, userId);

      expect(result).toEqual({ id: userId, name: 'Jane Doe' });
      expect(User.findOne).toHaveBeenCalledWith({ where: { id: userId, admin_id: currentUser.id } });
    });

    it('should throw a 404 error if the user is not found', async () => {
      const currentUser = { id: 2, roles: ['admin'] };
      const userId = 3;

      commonHelpers.getRolesAsBool.mockReturnValue({ isSuperAdmin: false, isUser: false, isAdmin: true });
      User.findOne.mockResolvedValue(null);
      commonHelpers.throwCustomError.mockImplementation((msg, code) => {
        throw new Error(`${code}: ${msg}`);
      });

      await expect(service.get(currentUser, userId)).rejects.toThrow('404: User not found');
    });
  });

  describe('update', () => {
    it('should update a user and return updated details', async () => {
      const currentUser = { id: 1, roles: ['admin'] };
      const id = 2;
      const payload = { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' };

      commonHelpers.getRolesAsBool.mockReturnValue({ isSuperAdmin: false });
      User.update.mockResolvedValue([1, [{ id: 2, first_name: 'Jane', last_name: 'Doe', email: 'jane@example.com' }]]);

      const result = await service.update(currentUser, id, payload);

      expect(result).toEqual({ id: 2, first_name: 'Jane', last_name: 'Doe', email: 'jane@example.com' });
      expect(User.update).toHaveBeenCalledWith(
        { first_name: 'Jane', last_name: 'Doe', email: 'jane@example.com' },
        {
          where: { id: 2, admin_id: 1 },
          returning: ['id', 'first_name', 'last_name', 'email', 'admin_id']
        }
      );
    });

    it('should throw an error if the user is not found', async () => {
      const currentUser = { id: 1, roles: ['admin'] };
      const id = 2;
      const payload = { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' };

      commonHelpers.getRolesAsBool.mockReturnValue({ isSuperAdmin: false });
      User.update.mockResolvedValue([0]);

      commonHelpers.throwCustomError.mockImplementation((msg, status) => {
        throw { message: msg, status };
      });

      await expect(service.update(currentUser, id, payload)).rejects.toEqual({
        message: 'User not found',
        status: 404
      });

      expect(User.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a user if the current user is a super admin', async () => {
      const currentUser = { roles: ['super_admin'] };
      const userId = 3;

      commonHelpers.getRolesAsBool.mockReturnValue({ isSuperAdmin: true });
      User.destroy.mockResolvedValue(1);

      const result = await service.remove(currentUser, userId);

      expect(result).toEqual({ count: 1, message: 'User removed successfully' });
      expect(User.destroy).toHaveBeenCalledWith({ where: { id: userId } });
    });

    it('should remove a user if the current user is an admin who created the user', async () => {
      const currentUser = { id: 2, roles: ['admin'] };
      const userId = 3;

      commonHelpers.getRolesAsBool.mockReturnValue({ isSuperAdmin: false });
      User.destroy.mockResolvedValue(1);

      const result = await service.remove(currentUser, userId);

      expect(result).toEqual({ count: 1, message: 'User removed successfully' });
      expect(User.destroy).toHaveBeenCalledWith({ where: { id: userId, admin_id: currentUser.id } });
    });

    it('should throw a 404 error if the user is not found', async () => {
      const currentUser = { id: 2, roles: ['admin'] };
      const userId = 3;

      commonHelpers.getRolesAsBool.mockReturnValue({ isSuperAdmin: false });
      User.destroy.mockResolvedValue(0);
      commonHelpers.throwCustomError.mockImplementation((msg, code) => {
        throw new Error(`${code}: ${msg}`);
      });

      await expect(service.remove(currentUser, userId)).rejects.toThrow('404: User not found');
    });
  });

  describe('bulkCreate', () => {
    it('should bulk create users and commit the transaction', async () => {
      const currentUser = { id: 1 };
      const payload = {
        users: [{ id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', password: 'password' }]
      };

      const transactionMock = { commit: jest.fn(), rollback: jest.fn() };
      sequelize.transaction.mockResolvedValue(transactionMock);

      bcrypt.hash.mockResolvedValueOnce('hashedPassword');

      Role.findOne.mockResolvedValueOnce({ id: 2 });
      User.create.mockResolvedValueOnce({ id: 1 });
      UserRole.create.mockResolvedValueOnce({});
      User.findOne.mockResolvedValueOnce(null);

      const result = await service.bulkCreate(currentUser, payload);

      expect(result).toEqual([1]);
      expect(transactionMock.commit).toHaveBeenCalled();
      expect(User.create).toHaveBeenCalledWith(
        {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          password: 'hashedPassword',
          admin_id: 1
        },
        { transaction: transactionMock }
      );
    });

    it('should rollback the transaction on error', async () => {
      const currentUser = { id: 1 };
      const payload = {
        users: [{ id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', password: 'password' }]
      };

      const transactionMock = { commit: jest.fn(), rollback: jest.fn() };
      sequelize.transaction.mockResolvedValue(transactionMock);
      bcrypt.hash.mockRejectedValue(new Error('Hashing error'));

      await expect(service.bulkCreate(currentUser, payload)).rejects.toThrow('Hashing error');

      expect(transactionMock.rollback).toHaveBeenCalled();
    });
  });

  describe('startExam', () => {
    it('should start the exam if conditions are met', async () => {
      const currentUser = { id: 1 };
      const params = { id: 1, examId: 10 };

      const mockExam = {
        id: 10,
        start_time: moment.utc().subtract(1, 'hour'),
        end_time: moment.utc().add(1, 'hour')
      };

      Exam.findOne.mockResolvedValue(mockExam);
      UserExam.update.mockResolvedValue([1, [{ id: 10, status: 'on-going' }]]);

      const result = await service.startExam(currentUser, params);

      expect(result).toEqual({ id: 10, status: 'on-going' });
      expect(Exam.findOne).toHaveBeenCalledWith({ id: 10 });
      expect(UserExam.update).toHaveBeenCalledWith(
        { status: 'on-going' },
        {
          where: {
            user_id: 1,
            exam_id: 10,
            status: { [Op.not]: 'completed' }
          },
          returning: true
        }
      );
    });

    it('should throw a 404 error if the exam is not found', async () => {
      const currentUser = { id: 1 };
      const params = { id: 1, examId: 10 };

      Exam.findOne.mockResolvedValue(null);
      commonHelpers.throwCustomError.mockImplementation((msg, code) => {
        throw new Error(`${code}: ${msg}`);
      });

      await expect(service.startExam(currentUser, params)).rejects.toThrow('404: Exam not found');
    });

    it('should throw a 403 error if the user tries to start an exam outside the allowed time window', async () => {
      const currentUser = { id: 1 };
      const params = { id: 1, examId: 10 };

      const mockExam = {
        id: 10,
        start_time: moment.utc().add(1, 'hour'),
        end_time: moment.utc().add(2, 'hours')
      };

      Exam.findOne.mockResolvedValue(mockExam);

      await expect(service.startExam(currentUser, params)).rejects.toThrow(
        '403: You can only join the exam within the allowed time window'
      );
    });
  });

  describe('getAllExams', () => {
    it('should return all exams for an admin', async () => {
      const currentUser = { id: 1, roles: ['admin'] };
      const params = { id: 1 };

      commonHelpers.getRolesAsBool.mockReturnValue({ isAdmin: true, isUser: false });
      Exam.findAll.mockResolvedValue([{ id: 1, name: 'Exam 1' }]);

      const result = await service.getAllExams(currentUser, params);

      expect(result).toEqual([{ id: 1, name: 'Exam 1' }]);
      expect(Exam.findAll).toHaveBeenCalledWith({
        where: { admin_id: 1 },
        include: [
          {
            model: User,
            where: { admin_id: 1, id: 1 },
            attributes: ['id'],
            required: true,
            through: { attributes: [], where: { deleted_at: null } }
          }
        ]
      });
    });

    it('should return a 403 error if a user tries to access another user’s exams', async () => {
      const currentUser = { id: 2, roles: ['user'] };
      const params = { id: 1 };

      commonHelpers.getRolesAsBool.mockReturnValue({ isAdmin: false, isUser: true });
      commonHelpers.throwCustomError.mockImplementation((msg, code) => {
        throw new Error(`${code}: ${msg}`);
      });

      await expect(service.getAllExams(currentUser, params)).rejects.toThrow(
        '403: Other user is not accessible to you'
      );
    });
  });
});
