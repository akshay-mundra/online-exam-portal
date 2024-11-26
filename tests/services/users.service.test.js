const { getAll, get, update, remove, bulkCreate, getAllExams } = require('../../src/services/users.service');
const { User, Exam } = require('../../src/models');
const commonHelpers = require('../../src/helpers/common.helper');
const { sequelize } = require('../../src/models');
const bcrypt = require('bcrypt');

jest.mock('../../src/models');
jest.mock('../../src/helpers/common.helper');
jest.mock('bcrypt');

describe('User Service', () => {
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

    bcrypt.hash.mockResolvedValue('hashedPassword');
  });

  describe('getAll', () => {
    it('should return all users for super admin', async () => {
      const currentUser = { roles: ['superadmin'], id: 1 };
      const page = 0;
      const limit = 10;
      const offset = 0;
      commonHelpers.getPaginationAttributes.mockReturnValue({ limit, offset });
      commonHelpers.getRolesAsBool.mockReturnValue({ isSuperAdmin: true });

      User.findAndCountAll.mockResolvedValue({
        count: 5,
        rows: [
          {
            id: 1,
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com'
          }
        ]
      });

      const result = await getAll(currentUser, page);

      expect(User.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        attributes: ['id', 'first_name', 'last_name', 'email', 'admin_id'],
        offset,
        limit
      });
      expect(result).toEqual({
        users: [
          {
            id: 1,
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com'
          }
        ],
        total: 5
      });
    });

    it('should return users created by the admin if the user is not a super admin', async () => {
      const currentUser = { roles: ['admin'], id: 1 };
      const page = 0;
      const limit = 10;
      const offset = 0;
      commonHelpers.getPaginationAttributes.mockReturnValue({ limit, offset });
      commonHelpers.getRolesAsBool.mockReturnValue({ isSuperAdmin: false });

      User.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: [
          {
            id: 1,
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com'
          }
        ]
      });

      const result = await getAll(currentUser, page);

      expect(User.findAndCountAll).toHaveBeenCalledWith({
        where: { admin_id: currentUser.id },
        attributes: ['id', 'first_name', 'last_name', 'email', 'admin_id'],
        offset,
        limit
      });
      expect(result).toEqual({
        users: [
          {
            id: 1,
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com'
          }
        ],
        total: 2
      });
    });
  });

  describe('get', () => {
    it('should return user details for superadmin', async () => {
      const currentUser = { roles: ['superadmin'], id: 1 };
      const id = 2;

      User.findOne.mockResolvedValue({
        id,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com'
      });
      commonHelpers.getRolesAsBool.mockReturnValue({ isSuperAdmin: true });

      await get(currentUser, id);

      expect(User.findOne).toHaveBeenCalledWith({ where: { id } });
    });

    it('should throw an error if user is not found', async () => {
      const currentUser = { roles: ['admin'], id: 1 };
      const id = 2;

      User.findOne.mockResolvedValue(null);

      await expect(get(currentUser, id)).rejects.toThrow('User not found');
    });
  });

  describe('update', () => {
    it('should update user successfully for superadmin', async () => {
      const currentUser = { roles: ['superadmin'], id: 1 };
      const id = 2;
      const payload = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com'
      };

      User.update.mockResolvedValue([
        1,
        [
          {
            id,
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane@example.com'
          }
        ]
      ]);
      commonHelpers.getRolesAsBool.mockReturnValue({ isSuperAdmin: true });

      const result = await update(currentUser, id, payload);

      expect(User.update).toHaveBeenCalledWith(
        {
          first_name: payload.firstName,
          last_name: payload.lastName,
          email: payload.email
        },
        expect.objectContaining({
          where: { id }
        })
      );
      expect(result).toEqual({
        id,
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com'
      });
    });

    it('should rollback transaction on error', async () => {
      const currentUser = { roles: ['superadmin'], id: 1 };
      const id = 2;
      const payload = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com'
      };

      User.update.mockRejectedValue(new Error('Update failed'));
      commonHelpers.getRolesAsBool.mockReturnValue({ isSuperAdmin: true });

      await expect(update(currentUser, id, payload)).rejects.toThrow('Update failed');
    });
  });

  describe('remove', () => {
    it('should remove user successfully for superadmin', async () => {
      const currentUser = { roles: ['superadmin'], id: 1 };
      const id = 2;

      User.destroy.mockResolvedValue(1);

      const result = await remove(currentUser, id);

      expect(User.destroy).toHaveBeenCalledWith({
        where: { id }
      });

      expect(result).toEqual({
        count: 1,
        message: 'User removed successfully'
      });
    });

    it('should rollback transaction on error', async () => {
      const currentUser = { roles: ['superadmin'], id: 1 };
      const id = 2;

      User.destroy.mockRejectedValue(new Error('Delete failed'));

      await expect(remove(currentUser, id)).rejects.toThrow('Delete failed');
    });
  });

  describe('bulkCreate', () => {
    it('should throw error if user is already created by another admin', async () => {
      const currentUser = { id: 1, roles: ['admin'] };
      const payload = {
        users: [
          {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'password123'
          }
        ]
      };

      const existingUser = { id: 2, email: 'john@example.com', admin_id: 2 };
      User.findOne.mockResolvedValue(existingUser);

      await expect(bulkCreate(currentUser, payload)).rejects.toThrow('The user you are updating is not created by you');
    });
  });

  describe('getAllExams', () => {
    it('should return all exams for admin', async () => {
      const currentUser = { id: 1, roles: ['admin'] };
      const params = { id: 1 };

      commonHelpers.getRolesAsBool.mockReturnValue({ isAdmin: true });

      Exam.findAll.mockResolvedValue([{ id: 1, name: 'Math Exam' }]);

      const result = await getAllExams(currentUser, params);

      expect(Exam.findAll).toHaveBeenCalledWith(expect.objectContaining({ where: { admin_id: currentUser.id } }));
      expect(result).toEqual([{ id: 1, name: 'Math Exam' }]);
    });

    it('should throw an error for unauthorized access', async () => {
      const currentUser = { roles: ['user'], id: 1 };
      const params = { id: 2 };

      commonHelpers.getRolesAsBool.mockReturnValue({ isUser: true });

      await expect(getAllExams(currentUser, params)).rejects.toThrow('Other user is not accessible to you');
    });
  });
});
