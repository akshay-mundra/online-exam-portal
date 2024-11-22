const { getAll, get, update } = require('../../src/services/exams.service');
const { Exam } = require('../../src/models');
const commonHelpers = require('../../src/helpers/common.helper');

jest.mock('../../src/models');
jest.mock('../../src/helpers/common.helper', () => ({
  getPaginationAttributes: jest.fn(),
  getRolesAsBool: jest.fn(),
  throwCustomError: jest.fn(),
}));
jest.mock('moment');
jest.mock('../../src/models', () => ({
  Exam: {
    findAndCountAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
    destroy: jest.fn(),
  },
  UserExam: {
    findOne: jest.fn(),
  },
  sequelize: {
    transaction: jest.fn(() => ({
      commit: jest.fn(),
      rollback: jest.fn(),
    })),
  },
}));

describe('Exam Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    commonHelpers.throwCustomError.mockImplementation(message => {
      const err = new Error(message);
      throw err;
    });
  });

  describe('getAll', () => {
    it('should return exams with pagination for super admin', async () => {
      commonHelpers.getPaginationAttributes.mockReturnValue({
        limit: 10,
        offset: 0,
      });
      commonHelpers.getRolesAsBool.mockReturnValue({ isSuperAdmin: true });

      const currentUser = { roles: ['superadmin'], id: 1 };
      const query = { limit: 10, page: 0, isPublished: true };

      Exam.findAndCountAll.mockResolvedValue({
        count: 10,
        rows: [{ id: 1, title: 'Test Exam' }],
      });

      const result = await getAll(currentUser, query);

      expect(result.exams).toHaveLength(1);
      expect(result.total).toBe(10);
    });

    it('should return exams for admin', async () => {
      commonHelpers.getPaginationAttributes.mockReturnValue({
        limit: 10,
        offset: 0,
      });
      commonHelpers.getRolesAsBool.mockReturnValue({
        isSuperAdmin: false,
        isAdmin: true,
      });

      const currentUser = { roles: ['admin'], id: 1 };
      const query = { limit: 10, page: 0, isPublished: true };

      Exam.findAndCountAll.mockResolvedValue({
        count: 5,
        rows: [{ id: 1, title: 'Admin Exam' }],
      });

      const result = await getAll(currentUser, query);

      expect(result.exams).toHaveLength(1);
      expect(result.total).toBe(5);
    });
  });

  describe('get', () => {
    it('should return exam details for super admin', async () => {
      commonHelpers.getRolesAsBool.mockReturnValue({ isSuperAdmin: true });
      const currentUser = { roles: ['superadmin'], id: 1 };
      const examId = 1;

      Exam.findOne.mockResolvedValue({ id: 1, title: 'Test Exam' });

      const result = await get(currentUser, examId);

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('title', 'Test Exam');
    });

    it('should throw error if exam not found', async () => {
      commonHelpers.getRolesAsBool.mockReturnValue({ isSuperAdmin: true });
      const currentUser = { roles: ['superadmin'], id: 1 };
      const examId = 999;

      Exam.findOne.mockResolvedValue(null);

      await expect(get(currentUser, examId)).rejects.toThrow('Exam not found');
    });
  });

  describe('update', () => {
    it('should update exam successfully', async () => {
      commonHelpers.getRolesAsBool.mockReturnValue({ isSuperAdmin: true });

      const currentUser = { roles: ['admin'], id: 1 };
      const examId = 1;
      const payload = {
        title: 'Updated Exam',
        startTime: new Date(),
        endTime: new Date(),
      };

      Exam.update.mockResolvedValue([1, [{ id: 1, ...payload }]]);
      await update(currentUser, examId, payload);

      expect(Exam.update).toHaveBeenCalled();
    });
  });
});
