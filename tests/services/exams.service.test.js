const {
  getAll,
  create,
  get,
  update,
  remove,
  getResult,
  addUser,
  getUser,
  removeUser,
  getAllUsers,
  createQuestion,
  getAllQuestions,
  getQuestion,
  removeQuestion,
  updateQuestion
} = require('../../src/services/exams.service');
const { Exam, UserExam, User, Question, Option } = require('../../src/models');
const commonHelpers = require('../../src/helpers/common.helper');
const { sequelize } = require('../../src/models');
const moment = require('moment');
const mockCalculateUserScore = jest.fn();

jest.mock('../../src/models');
jest.mock('../../src/helpers/common.helper');
jest.mock('../../src/services/users-exams.service', () => ({
  calculateUserScore: jest.fn(() => mockCalculateUserScore)
}));

describe('Exam Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    commonHelpers.getRolesAsBool.mockReturnValue({ isSuperAdmin: true });
    commonHelpers.throwCustomError.mockImplementation(message => {
      throw new Error(message);
    });

    Exam.findAndCountAll.mockResolvedValue({
      count: 1,
      rows: [{ id: 1, title: 'Test Exam' }]
    });
    Exam.create.mockResolvedValue({ id: 1, title: 'New Exam' });

    sequelize.transaction.mockResolvedValue({
      commit: jest.fn(),
      rollback: jest.fn()
    });
  });

  describe('getAll', () => {
    it('should return all exams for a super admin', async () => {
      const currentUser = { roles: ['super_admin'], id: 1 };
      const query = { page: 0, limit: 10 };
      const mockExams = [
        { id: 1, title: 'Exam 1' },
        { id: 2, title: 'Exam 2' }
      ];
      Exam.findAndCountAll.mockResolvedValue({ count: 2, rows: mockExams });
      commonHelpers.getRolesAsBool.mockReturnValue({ isSuperAdmin: true });
      commonHelpers.getPaginationAttributes.mockReturnValue({
        limit: 10,
        offset: 0
      });

      const result = await getAll(currentUser, query);

      expect(Exam.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        limit: 10,
        offset: 0
      });
      expect(result).toEqual({ exams: mockExams, total: 2 });
    });

    it('should throw an error if Exam.findAndCountAll fails', async () => {
      const currentUser = { roles: ['super_admin'], id: 1 };
      const query = { page: 0, limit: 10 };
      Exam.findAndCountAll.mockRejectedValue(new Error('DB error'));

      await expect(getAll(currentUser, query)).rejects.toThrow('DB error');
    });
  });

  describe('create', () => {
    it('should create a new exam successfully', async () => {
      const currentUser = { id: 1 };
      const payload = {
        title: 'New Exam',
        startTime: '2024-01-01',
        endTime: '2024-01-02'
      };
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      sequelize.transaction.mockResolvedValue(transaction);
      Exam.create.mockResolvedValue({ id: 1, ...payload });

      const result = await create(currentUser, payload);

      expect(Exam.create).toHaveBeenCalledWith({
        title: 'New Exam',
        start_time: '2024-01-01',
        end_time: '2024-01-02',
        admin_id: currentUser.id
      });

      expect(result).toEqual({ id: 1, ...payload });
    });

    it('should rollback transaction on failure', async () => {
      const currentUser = { id: 1 };
      const payload = {
        title: 'New Exam',
        startTime: '2024-01-01',
        endTime: '2024-01-02'
      };
      const transaction = { commit: jest.fn(), rollback: jest.fn() };
      sequelize.transaction.mockResolvedValue(transaction);
      Exam.create.mockRejectedValue(new Error('DB error'));

      await expect(create(currentUser, payload)).rejects.toThrow('DB error');
    });
  });

  describe('get()', () => {
    it('should return exam for a super admin', async () => {
      const mockExam = { id: 1, title: 'Mock Exam' };
      Exam.findOne.mockResolvedValue(mockExam);
      commonHelpers.getRolesAsBool.mockReturnValue({ isSuperAdmin: true });

      const result = await get({ roles: ['super_admin'] }, 1);

      expect(Exam.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockExam);
    });

    it('should throw error if user is not assigned to exam', async () => {
      commonHelpers.getRolesAsBool.mockReturnValue({
        isSuperAdmin: false,
        isUser: true
      });
      UserExam.findOne.mockResolvedValue(null);
      commonHelpers.throwCustomError.mockImplementation(msg => {
        throw new Error(msg);
      });

      await expect(get({ roles: ['user'], id: 1 }, 1)).rejects.toThrow('User is not assigned to this exam');

      expect(UserExam.findOne).toHaveBeenCalledWith({
        where: { exam_id: 1, user_id: 1 }
      });
    });
  });

  describe('update()', () => {
    it('should update exam details successfully', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      sequelize.transaction.mockResolvedValue(mockTransaction);
      Exam.update.mockResolvedValue([1, [{ id: 1, title: 'Updated Exam' }]]);

      const result = await update({ id: 1 }, 1, {
        title: 'Updated Exam',
        startTime: '2024-01-01',
        endTime: '2024-01-02'
      });

      expect(Exam.update).toHaveBeenCalledWith(
        {
          title: 'Updated Exam',
          start_time: '2024-01-01',
          end_time: '2024-01-02'
        },
        { where: { id: 1, admin_id: 1, is_published: false }, returning: true }
      );
      expect(result).toEqual([{ id: 1, title: 'Updated Exam' }]);
    });

    it('should rollback transaction on error', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      sequelize.transaction.mockResolvedValue(mockTransaction);
      Exam.update.mockRejectedValue(new Error('DB Error'));

      await expect(update({ id: 1 }, 1, { title: 'Failed Update' })).rejects.toThrow('DB Error');
    });
  });

  describe('remove()', () => {
    it('should remove exam successfully', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      sequelize.transaction.mockResolvedValue(mockTransaction);
      Exam.destroy.mockResolvedValue(1);

      const result = await remove({ id: 1 }, 1);

      expect(Exam.destroy).toHaveBeenCalled();

      expect(result).toEqual({
        message: 'Exam deleted successfully!',
        countChanged: 1
      });
    });

    it('should throw error if exam is ongoing', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      sequelize.transaction.mockResolvedValue(mockTransaction);
      Exam.destroy.mockResolvedValue(0);
      commonHelpers.throwCustomError.mockImplementation(msg => {
        throw new Error(msg);
      });

      await expect(remove({ id: 1 }, 1)).rejects.toThrow('exam not found or exam is currently on going');
    });
  });

  describe('getResult Service', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return results successfully', async () => {
      const currentTime = moment.utc();
      const mockExam = {
        id: 1,
        end_time: currentTime.subtract(1, 'day').toDate()
      };
      const mockUsers = [
        {
          id: 1,
          email: 'user@example.com',
          first_name: 'John',
          last_name: 'Doe',
          Exams: [{ users_exams: { id: 1, score: 50 } }]
        }
      ];

      Exam.findByPk.mockResolvedValue(mockExam);
      User.findAll.mockResolvedValue(mockUsers);
      mockCalculateUserScore.mockResolvedValue(50);

      await getResult({ id: 1 }, 1);

      expect(Exam.findByPk).toHaveBeenCalledWith(1);
      expect(User.findAll).toHaveBeenCalled();
    });

    it('should throw error if exam is not found', async () => {
      Exam.findByPk.mockResolvedValue(null);
      await expect(getResult({ id: 1 }, 1)).rejects.toThrow('Exam not found');
      expect(Exam.findByPk).toHaveBeenCalled();
    });

    it('should throw error if exam has not ended yet', async () => {
      const futureTime = moment.utc().add(1, 'day');
      Exam.findByPk.mockResolvedValue({ id: 1, end_time: futureTime.toDate() });

      await expect(getResult({ id: 1 }, 1)).rejects.toThrow('Exam is not ended yet');
      expect(Exam.findByPk).toHaveBeenCalled();
    });
  });

  describe('addUser Service', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully add a user to an exam', async () => {
      const mockExam = { id: 1, is_published: false };
      const mockUser = { id: 2, admin_id: 1 };
      const mockUserExam = { id: 1 };

      Exam.findByPk.mockResolvedValue(mockExam);
      User.findByPk.mockResolvedValue(mockUser);
      UserExam.findOrCreate.mockResolvedValue([mockUserExam, true]);

      const result = await addUser({ id: 1 }, 1, { userId: 2 });

      expect(Exam.findByPk).toHaveBeenCalledWith(1);
      expect(User.findByPk).toHaveBeenCalledWith(2);
      expect(UserExam.findOrCreate).toHaveBeenCalled();
      expect(result).toEqual(mockUserExam);
    });

    it('should throw error if exam is not found', async () => {
      Exam.findByPk.mockResolvedValue(null);

      await expect(addUser({ id: 1 }, 1, { userId: 2 })).rejects.toThrow('Exam not found');
      expect(Exam.findByPk).toHaveBeenCalled();
    });

    it('should throw error if user is not found', async () => {
      const mockExam = { id: 1, is_published: false };
      Exam.findByPk.mockResolvedValueOnce(mockExam);
      User.findByPk.mockResolvedValueOnce(null);

      await expect(addUser({ id: 1 }, 1, { userId: 2 })).rejects.toThrow('User not found');
      expect(User.findByPk).toHaveBeenCalled();
    });

    it('should throw error if user does not belong to admin', async () => {
      const mockExam = { id: 1, is_published: false };
      const mockUser = { id: 2, admin_id: 3 };
      Exam.findByPk.mockResolvedValue(mockExam);
      User.findByPk.mockResolvedValue(mockUser);

      await expect(addUser({ id: 1 }, 1, { userId: 2 })).rejects.toThrow('Can not add user that is not created by you');
      expect(User.findByPk).toHaveBeenCalled();
    });

    it('should throw error if user is already assigned', async () => {
      const mockExam = { id: 1, is_published: false };
      const mockUser = { id: 2, admin_id: 1 };
      Exam.findByPk.mockResolvedValue(mockExam);
      User.findByPk.mockResolvedValue(mockUser);
      UserExam.findOrCreate.mockResolvedValue([{}, false]);

      await expect(addUser({ id: 1 }, 1, { userId: 2 })).rejects.toThrow('User is already assigned this exam');
    });
  });

  describe('getAllUsers()', () => {
    it('should return a list of users for the exam', async () => {
      const mockUsers = [
        {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com'
        },
        {
          id: 2,
          first_name: 'Jane',
          last_name: 'Doe',
          email: 'jane@example.com'
        }
      ];
      User.findAll.mockResolvedValue(mockUsers);
      commonHelpers.getRolesAsBool.mockReturnValue({ isSuperAdmin: true });
      commonHelpers.getPaginationAttributes.mockReturnValue({
        limit: 10,
        offset: 0
      });

      const result = await getAllUsers({ roles: ['super_admin'] }, 1, {
        page: 1,
        limit: 10
      });

      expect(User.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array when no users are found', async () => {
      User.findAll.mockResolvedValue([]);
      commonHelpers.getRolesAsBool.mockReturnValue({ isSuperAdmin: true });

      const result = await getAllUsers({ roles: ['super_admin'] }, 1, {
        page: 1,
        limit: 10
      });

      expect(result).toEqual([]);
    });
  });

  describe('getUser()', () => {
    it('should return the user for a super admin', async () => {
      const mockUser = {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com'
      };
      User.findOne.mockResolvedValue(mockUser);
      commonHelpers.getRolesAsBool.mockReturnValue({ isSuperAdmin: true });

      const result = await getUser({ roles: ['super_admin'], id: 1 }, 1, 1);

      expect(User.findOne).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 1 } }));
      expect(result).toEqual(mockUser);
    });

    it('should throw error if user is not found', async () => {
      commonHelpers.getRolesAsBool.mockReturnValue({ isSuperAdmin: true });
      User.findOne.mockResolvedValue(null);
      commonHelpers.throwCustomError.mockImplementation(msg => {
        throw new Error(msg);
      });

      await expect(getUser({ roles: ['super_admin'], id: 1 }, 1, 1)).rejects.toThrow('User not found');
    });

    it("should throw error if user tries to access another user's exam", async () => {
      commonHelpers.getRolesAsBool.mockReturnValue({ isUser: true });
      commonHelpers.throwCustomError.mockImplementation(msg => {
        throw new Error(msg);
      });

      await expect(getUser({ roles: ['user'], id: 1 }, 2, 1)).rejects.toThrow('Can not access other user');
    });
  });

  describe('removeUser Service', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully remove a user from an exam', async () => {
      const mockUser = { id: 1, admin_id: 1 };
      const mockExam = { id: 2, admin_id: 1, is_published: false };

      User.findOne.mockResolvedValue(mockUser);
      Exam.findOne.mockResolvedValue(mockExam);
      UserExam.destroy.mockResolvedValue(1);

      const result = await removeUser({ id: 1 }, 1, 2);

      expect(User.findOne).toHaveBeenCalledWith({
        where: { id: 1, admin_id: 1 }
      });
      expect(Exam.findOne).toHaveBeenCalledWith({
        where: { id: 2, admin_id: 1 }
      });
      expect(UserExam.destroy).toHaveBeenCalled();
      expect(result).toEqual('User removed from exam successfully');
    });

    it('should throw error if user is not found', async () => {
      User.findOne.mockResolvedValue(null);

      await expect(removeUser({ id: 1 }, 1, 2)).rejects.toThrow('User not found');
      expect(User.findOne).toHaveBeenCalled();
    });

    it('should throw error if exam is not found', async () => {
      const mockUser = { id: 1, admin_id: 1 };
      User.findOne.mockResolvedValueOnce(mockUser);
      Exam.findOne.mockResolvedValueOnce(null);

      await expect(removeUser({ id: 1 }, 1, 2)).rejects.toThrow('Exam not found');
      expect(Exam.findOne).toHaveBeenCalled();
    });

    it('should throw error if user-exam association is not found', async () => {
      const mockUser = { id: 1, admin_id: 1 };
      const mockExam = { id: 2, admin_id: 1, is_published: false };
      User.findOne.mockResolvedValue(mockUser);
      Exam.findOne.mockResolvedValue(mockExam);
      UserExam.destroy.mockResolvedValue(0);

      await expect(removeUser({ id: 1 }, 1, 2)).rejects.toThrow('User is not associated to this exam');
    });
  });

  describe('createQuestion()', () => {
    it('should create a new question successfully', async () => {
      const mockQuestion = {
        id: 1,
        question: 'Sample Question',
        type: 'single_choice'
      };
      const mockOptions = [{ option: 'Option 1', isCorrect: true, marks: 1 }];
      const transactionContext = { commit: jest.fn(), rollback: jest.fn() };

      sequelize.transaction.mockResolvedValue(transactionContext);
      Exam.findByPk.mockResolvedValue({
        id: 1,
        admin_id: 1,
        is_published: false
      });
      Question.create.mockResolvedValue(mockQuestion);
      Option.bulkCreate.mockResolvedValue(mockOptions);

      await createQuestion({ id: 1 }, 1, {
        question: 'Sample Question',
        type: 'single_choice',
        negativeMarks: 0,
        options: mockOptions
      });

      expect(Question.create).toHaveBeenCalledWith(
        {
          exam_id: 1,
          question: 'Sample Question',
          type: 'single_choice',
          negative_marks: 0
        },
        { transaction: transactionContext }
      );
      expect(Option.bulkCreate).toHaveBeenCalled();
      expect(transactionContext.commit).toHaveBeenCalled();
    });

    it('should throw error if no options are provided', async () => {
      commonHelpers.throwCustomError.mockImplementation(msg => {
        throw new Error(msg);
      });

      await expect(
        createQuestion({ id: 1 }, 1, {
          question: 'Sample Question',
          type: 'single_choice',
          negativeMarks: 0,
          options: []
        })
      ).rejects.toThrow('options are required');
    });

    it('should throw error if exam is already published', async () => {
      const mockExam = { admin_id: 1, is_published: true };
      Exam.findByPk.mockResolvedValue(mockExam);
      commonHelpers.throwCustomError.mockImplementation(msg => {
        throw new Error(msg);
      });

      await expect(
        createQuestion({ id: 1 }, 1, {
          question: 'Sample Question',
          type: 'single_choice',
          negativeMarks: 0,
          options: [{ option: 'Option 1', isCorrect: true, marks: 1 }]
        })
      ).rejects.toThrow('Exam is already published');
    });
  });

  describe('getAllQuestions()', () => {
    it('should return all questions for the exam', async () => {
      const mockQuestions = [
        { id: 1, question: 'Sample Question', type: 'single_choice' },
        { id: 2, question: 'Another Question', type: 'multiple_choice' }
      ];

      Question.findAll.mockResolvedValue(mockQuestions);
      commonHelpers.getRolesAsBool.mockReturnValue({ isSuperAdmin: true });
      commonHelpers.getPaginationAttributes.mockReturnValue({
        limit: 10,
        offset: 0
      });

      const result = await getAllQuestions({ roles: ['super_admin'] }, 1, {
        page: 1,
        limit: 10
      });

      expect(Question.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockQuestions);
    });

    it('should return an empty array if no questions are found', async () => {
      Question.findAll.mockResolvedValue([]);
      commonHelpers.getRolesAsBool.mockReturnValue({ isSuperAdmin: true });

      const result = await getAllQuestions({ roles: ['super_admin'] }, 1, {
        page: 1,
        limit: 10
      });

      expect(result).toEqual([]);
    });
  });

  describe('getQuestion()', () => {
    describe('getQuestion()', () => {
      it('should return a question with options for an admin', async () => {
        const mockQuestion = {
          id: 1,
          question: 'Sample Question',
          type: 'single_choice'
        };
        const mockOptions = [{ option: 'Option 1', isCorrect: true, marks: 1 }];

        Question.findOne.mockResolvedValueOnce(mockQuestion);
        Option.findAll.mockResolvedValueOnce(mockOptions);
        commonHelpers.getRolesAsBool.mockReturnValueOnce({
          isSuperAdmin: true
        });

        await getQuestion({ roles: ['super_admin'] }, 1, 1, 1);

        expect(Question.findOne).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: 1 }
          })
        );
      });
    });

    it('should throw error if question not found', async () => {
      commonHelpers.throwCustomError.mockImplementation(msg => {
        throw new Error(msg);
      });
      Question.findOne.mockResolvedValue(null);

      await expect(getQuestion({ roles: ['super_admin'] }, 1, 1, 1)).rejects.toThrow('Question not found');
    });
  });

  describe('updateQuestion()', () => {
    it('should update a question successfully', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      sequelize.transaction.mockResolvedValue(mockTransaction);
      Question.update.mockResolvedValue([1, [{ id: 1, question: 'Updated Question' }]]);

      const result = await updateQuestion({ id: 1 }, 1, 1, {
        question: 'Updated Question',
        type: 'multiple_choice',
        negativeMarks: 1
      });

      expect(Question.update).toHaveBeenCalled();

      expect(result).toEqual([{ id: 1, question: 'Updated Question' }]);
    });

    it('should rollback transaction if update fails', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      sequelize.transaction.mockResolvedValue(mockTransaction);
      Question.update.mockRejectedValue(new Error('Update failed'));

      await expect(updateQuestion({ id: 1 }, 1, 1, { question: 'Failed Update' })).rejects.toThrow('Update failed');
    });
  });

  describe('removeQuestion()', () => {
    it('should remove a question successfully', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      sequelize.transaction.mockResolvedValue(mockTransaction);
      Question.destroy.mockResolvedValue(1);

      await removeQuestion({ id: 1 }, 1, 1);

      expect(Question.destroy).toHaveBeenCalled();
    });

    it('should throw error if question not found', async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      sequelize.transaction.mockResolvedValue(mockTransaction);
      Question.destroy.mockResolvedValue(0);
      commonHelpers.throwCustomError.mockImplementation(msg => {
        throw new Error(msg);
      });

      await expect(removeQuestion({ id: 1 }, 1, 1)).rejects.toThrow('Question not found');
    });
  });
});
