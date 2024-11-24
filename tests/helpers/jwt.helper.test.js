const jwt = require('jsonwebtoken');
const { signToken, verifyToken } = require('../../src/helpers/jwt.helper');

//
jest.mock('jsonwebtoken');

describe('JWT Helper Functions', () => {
  describe('signToken', () => {
    it('should sign a JWT token with the given payload and options', () => {
      const payload = { userId: 123 };
      const options = { expiresIn: '1h' };
      const secret = process.env.JWT_SECRET;
      const token = 'mocked-jwt-token';

      jwt.sign.mockReturnValue(token);

      const result = signToken(payload, options);

      expect(jwt.sign).toHaveBeenCalledWith(payload, secret, options);
      expect(result).toBe(token);
    });

    it('should use default expiration option when not provided', () => {
      const payload = { userId: 123 };
      const defaultOptions = { expiresIn: process.env.JWT_EXPIRE_IN };
      const token = 'mocked-jwt-token';

      jwt.sign.mockReturnValue(token);

      const result = signToken(payload);

      expect(jwt.sign).toHaveBeenCalledWith(
        payload,
        process.env.JWT_SECRET,
        defaultOptions,
      );
      expect(result).toBe(token);
    });
  });

  describe('verifyToken', () => {
    it('should verify the JWT token and return the decoded payload', () => {
      const token = 'mocked-jwt-token';
      const decodedPayload = { userId: 123 };

      jwt.verify.mockReturnValue(decodedPayload);

      const result = verifyToken(token);

      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
      expect(result).toEqual(decodedPayload);
    });

    it('should throw an error if the token is invalid', () => {
      const token = 'invalid-token';
      const error = new Error('invalid token');

      jwt.verify.mockImplementation(() => {
        throw error;
      });

      expect(() => verifyToken(token)).toThrow(error);
    });
  });
});
