const { validateRequest } = require('../../src/helpers/validators.helper');
const Joi = require('joi');
const commonHelpers = require('../../src/helpers/common.helper');

jest.mock('../../src/helpers/common.helper', () => ({
  throwCustomError: jest.fn(),
}));

describe('Validators Helper Functions', () => {
  const mockReq = {
    body: { name: 'John' },
    query: { age: '25' },
    params: { id: '123' },
  };
  const mockRes = {};
  const mockNext = jest.fn();

  beforeEach(() => {
    mockNext.mockClear();
  });

  describe('validateRequest', () => {
    it('should call next() if validation is successful for query', () => {
      const schema = Joi.object({
        age: Joi.number().required(),
      });

      const validateMock = { value: { age: 25 }, error: null };
      schema.validate = jest.fn().mockReturnValue(validateMock);

      validateRequest(mockReq, mockRes, mockNext, schema, 'query');

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockReq.query).toEqual({ age: 25 });
    });

    it('should call next() if validation is successful for params', () => {
      const schema = Joi.object({
        id: Joi.string().required(),
      });

      const validateMock = { value: { id: '123' }, error: null };
      schema.validate = jest.fn().mockReturnValue(validateMock);

      validateRequest(mockReq, mockRes, mockNext, schema, 'params');

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockReq.params).toEqual({ id: '123' });
    });

    it('should call throwCustomError if validation fails for body', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
      });

      const validateMock = {
        value: {},
        error: { message: '"name" is required' },
      };
      schema.validate = jest.fn().mockReturnValue(validateMock);

      validateRequest(mockReq, mockRes, mockNext, schema, 'body');

      expect(commonHelpers.throwCustomError).toHaveBeenCalledWith(
        'name is required',
        422,
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call throwCustomError if validation fails for query', () => {
      const schema = Joi.object({
        age: Joi.number().required(),
      });

      const validateMock = {
        value: {},
        error: { message: '"age" is required' },
      };
      schema.validate = jest.fn().mockReturnValue(validateMock);

      validateRequest(mockReq, mockRes, mockNext, schema, 'query');

      expect(commonHelpers.throwCustomError).toHaveBeenCalledWith(
        'age is required',
        422,
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call throwCustomError if validation fails for params', () => {
      const schema = Joi.object({
        id: Joi.string().required(),
      });

      const validateMock = {
        value: {},
        error: { message: '"id" is required' },
      };
      schema.validate = jest.fn().mockReturnValue(validateMock);

      validateRequest(mockReq, mockRes, mockNext, schema, 'params');

      expect(commonHelpers.throwCustomError).toHaveBeenCalledWith(
        'id is required',
        422,
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
