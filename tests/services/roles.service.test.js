const { create, get, getAll, update, remove } = require('../../src/services/roles.service');
const { Role } = require('../../src/models');
const commonHelpers = require('../../src/helpers/common.helper');
const { sequelize } = require('../../src/models');

jest.mock('../../src/models');
jest.mock('../../src/helpers/common.helper');

describe('Role Service', () => {
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
  });

  describe('create', () => {
    it('should create a role successfully', async () => {
      const payload = { name: 'Admin' };
      Role.findOne.mockResolvedValue(null);
      Role.create.mockResolvedValue({ id: '1', name: 'Admin' });

      const result = await create(payload);

      expect(Role.findOne).toHaveBeenCalledWith({
        where: { name: payload.name }
      });
      expect(Role.create).toHaveBeenCalledWith({ name: payload.name }, { transaction: transactionContext });
      expect(transactionContext.commit).toHaveBeenCalled();
      expect(result).toEqual({ id: '1', name: 'Admin' });
    });

    it('should throw an error if role already exists', async () => {
      const payload = { name: 'Admin' };

      Role.findOne.mockResolvedValue({ id: '1', name: 'Admin' });

      await expect(create(payload)).rejects.toThrow('Role already exist');

      expect(Role.findOne).toHaveBeenCalled();
      expect(commonHelpers.throwCustomError).toHaveBeenCalledWith('Role already exist', 400);
      expect(transactionContext.rollback).toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      const payload = { name: 'Admin' };
      Role.findOne.mockResolvedValue(null);
      Role.create.mockRejectedValue(new Error('Database Error'));

      await expect(create(payload)).rejects.toThrow('Database Error');
      expect(transactionContext.rollback).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    beforeEach(() => {
      commonHelpers.throwCustomError.mockImplementation((message, statusCode) => {
        const error = new Error(message);
        error.statusCode = statusCode;
        throw error;
      });
    });
    it('should update a role successfully', async () => {
      const id = '1';
      const payload = { name: 'Super Admin' };
      const role = { id, name: 'Super Admin', save: jest.fn() };
      Role.update.mockResolvedValue([1, [role]]);

      const result = await update(id, payload);

      expect(Role.update).toHaveBeenCalledWith(
        { name: payload.name },
        { where: { id } },
        { transaction: transactionContext }
      );
      expect(transactionContext.commit).toHaveBeenCalled();
      expect(result).toEqual([role]);
    });

    it('should rollback transaction on error', async () => {
      const id = '1';
      const payload = { name: 'Super Admin' };

      Role.update.mockRejectedValue(new Error('Database Error'));

      await expect(update(id, payload)).rejects.toThrow('Database Error');
      expect(transactionContext.rollback).toHaveBeenCalled();
    });

    it('should throw an error if role does not exist', async () => {
      const id = '1';
      const payload = { name: 'Super Admin' };

      Role.update.mockResolvedValue([0, []]);

      await expect(update(id, payload)).rejects.toThrow('Role not found');
      expect(transactionContext.rollback).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a role successfully', async () => {
      const id = '1';
      const role = { id, name: 'Admin' };
      Role.findOne.mockResolvedValue(role);
      Role.destroy.mockResolvedValue(1);

      const result = await remove(id);

      expect(Role.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(Role.destroy).toHaveBeenCalledWith({ where: { id: role.id } }, { transaction: transactionContext });
      expect(transactionContext.commit).toHaveBeenCalled();
      expect(result).toBe('Role removed successfully');
    });

    it('should rollback transaction on error', async () => {
      const id = '1';
      Role.findOne.mockResolvedValue({ id, name: 'Admin' });
      Role.destroy.mockRejectedValue(new Error('Database Error'));

      await expect(remove(id)).rejects.toThrow('Database Error');
      expect(transactionContext.rollback).toHaveBeenCalled();
    });

    it('should throw an error if role not found', async () => {
      const id = 1;

      Role.findOne.mockResolvedValue(null);

      await expect(remove(id)).rejects.toThrow('Role not found');

      expect(commonHelpers.throwCustomError).toHaveBeenCalledWith('Role not found', 404);
      expect(transactionContext.rollback).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should return the role if found', async () => {
      const id = '1';
      const role = { id, name: 'Admin' };
      Role.findOne.mockResolvedValue(role);

      const result = await get(id);

      expect(Role.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(role);
    });

    it('should throw an error if role is not found', async () => {
      Role.findOne.mockResolvedValue(null);
    });
  });

  describe('getAll', () => {
    it('should return all roles', async () => {
      const roles = [{ id: '1', name: 'Admin' }];
      Role.findAll.mockResolvedValue(roles);

      const result = await getAll();

      expect(Role.findAll).toHaveBeenCalled();
      expect(result).toEqual(roles);
    });
  });
});
