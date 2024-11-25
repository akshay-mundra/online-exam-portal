const { signToken, verifyToken } = require('../../src/helpers/jwt.helper');
const jose = require('jose');

jest.mock('jose');

describe('JWT Helper Functions', () => {
  const mockDecodedSecret = Buffer.from([
    154, 135, 36, 250, 199, 156, 173, 235,
  ]); // Mock decoded secret
  const mockPayload = { id: 1, role: 'admin' };
  const mockOptions = { expiresIn: '1h' };
  const mockToken = 'mock-jwt-token';

  beforeEach(() => {
    process.env.JWT_SECRET = 'mock-secret';
    process.env.JWT_EXPIRE_IN = '1h';

    // Mock jose.base64url.decode to return the mockDecodedSecret
    jose.base64url = {
      decode: jest.fn(() => mockDecodedSecret),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signToken', () => {
    it('should generate a JWT token with valid payload and options', async () => {
      // Mock EncryptJWT behavior
      const mockEncryptJWT = {
        setProtectedHeader: jest.fn().mockReturnThis(),
        setIssuedAt: jest.fn().mockReturnThis(),
        setExpirationTime: jest.fn().mockReturnThis(),
        encrypt: jest.fn().mockResolvedValue(mockToken),
      };
      jest.spyOn(jose, 'EncryptJWT').mockReturnValue(mockEncryptJWT);

      const token = await signToken(mockPayload, mockOptions);

      expect(jose.EncryptJWT).toHaveBeenCalledWith(mockPayload);
      expect(mockEncryptJWT.setProtectedHeader).toHaveBeenCalledWith({
        alg: 'dir',
        enc: 'A128CBC-HS256',
      });
      expect(mockEncryptJWT.setIssuedAt).toHaveBeenCalled();
      expect(mockEncryptJWT.setExpirationTime).toHaveBeenCalledWith(
        mockOptions.expiresIn,
      );
      expect(mockEncryptJWT.encrypt).toHaveBeenCalled();
      expect(token).toBe(mockToken);
    });

    it('should handle errors thrown by EncryptJWT', async () => {
      jest.spyOn(jose, 'EncryptJWT').mockImplementation(() => {
        throw new Error('Encryption failed');
      });

      await expect(signToken(mockPayload, mockOptions)).rejects.toThrow(
        'Encryption failed',
      );
    });
  });

  describe('verifyToken', () => {
    it('should decrypt a valid JWT token and return the payload', async () => {
      const mockDecryptedPayload = { id: 1, role: 'admin' };
      jose.jwtDecrypt.mockResolvedValue({ payload: mockDecryptedPayload });

      const payload = await verifyToken(mockToken);

      expect(jose.jwtDecrypt).toHaveBeenCalled();
      expect(payload).toEqual(mockDecryptedPayload);
    });

    it('should handle invalid token errors during decryption', async () => {
      jose.jwtDecrypt.mockRejectedValue(new Error('Invalid token'));

      await expect(verifyToken(mockToken)).rejects.toThrow('Invalid token');
    });
  });
});

// const jwt = require('jsonwebtoken');
// const { signToken, verifyToken } = require('../../src/helpers/jwt.helper');

// //
// jest.mock('jsonwebtoken');

// describe('JWT Helper Functions', () => {
//   describe('signToken', () => {
//     it('should sign a JWT token with the given payload and options', () => {
//       const payload = { userId: 123 };
//       const options = { expiresIn: '1h' };
//       const secret = process.env.JWT_SECRET;
//       const token = 'mocked-jwt-token';

//       jwt.sign.mockReturnValue(token);

//       const result = signToken(payload, options);

//       expect(jwt.sign).toHaveBeenCalledWith(payload, secret, options);
//       expect(result).toBe(token);
//     });

//     it('should use default expiration option when not provided', () => {
//       const payload = { userId: 123 };
//       const defaultOptions = { expiresIn: process.env.JWT_EXPIRE_IN };
//       const token = 'mocked-jwt-token';

//       jwt.sign.mockReturnValue(token);

//       const result = signToken(payload);

//       expect(jwt.sign).toHaveBeenCalledWith(
//         payload,
//         process.env.JWT_SECRET,
//         defaultOptions,
//       );
//       expect(result).toBe(token);
//     });
//   });

//   describe('verifyToken', () => {
//     it('should verify the JWT token and return the decoded payload', () => {
//       const token = 'mocked-jwt-token';
//       const decodedPayload = { userId: 123 };

//       jwt.verify.mockReturnValue(decodedPayload);

//       const result = verifyToken(token);

//       expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
//       expect(result).toEqual(decodedPayload);
//     });

//     it('should throw an error if the token is invalid', () => {
//       const token = 'invalid-token';
//       const error = new Error('invalid token');

//       jwt.verify.mockImplementation(() => {
//         throw error;
//       });

//       expect(() => verifyToken(token)).toThrow(error);
//     });
//   });
// });
