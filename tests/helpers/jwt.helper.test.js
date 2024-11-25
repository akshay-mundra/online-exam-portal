const { signToken, verifyToken } = require('../../src/helpers/jwt.helper');
const jose = require('jose');

jest.mock('jose');

describe('JWT Helper Functions', () => {
  const mockDecodedSecret = Buffer.from([154, 135, 36, 250, 199, 156, 173, 235]);
  const mockPayload = { id: 1, role: 'admin' };
  const mockOptions = { expiresIn: '1h' };
  const mockToken = 'mock-jwt-token';

  beforeEach(() => {
    process.env.JWT_SECRET = 'mock-secret';
    process.env.JWT_EXPIRE_IN = '1h';

    jose.base64url = {
      decode: jest.fn(() => mockDecodedSecret)
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signToken', () => {
    it('should generate a JWT token with valid payload and options', async () => {
      const mockEncryptJWT = {
        setProtectedHeader: jest.fn().mockReturnThis(),
        setIssuedAt: jest.fn().mockReturnThis(),
        setExpirationTime: jest.fn().mockReturnThis(),
        encrypt: jest.fn().mockResolvedValue(mockToken)
      };
      jest.spyOn(jose, 'EncryptJWT').mockReturnValue(mockEncryptJWT);

      const token = await signToken(mockPayload, mockOptions);

      expect(jose.EncryptJWT).toHaveBeenCalledWith(mockPayload);
      expect(mockEncryptJWT.setProtectedHeader).toHaveBeenCalledWith({
        alg: 'dir',
        enc: 'A128CBC-HS256'
      });
      expect(mockEncryptJWT.setIssuedAt).toHaveBeenCalled();
      expect(mockEncryptJWT.setExpirationTime).toHaveBeenCalledWith(mockOptions.expiresIn);
      expect(mockEncryptJWT.encrypt).toHaveBeenCalled();
      expect(token).toBe(mockToken);
    });

    it('should handle errors thrown by EncryptJWT', async () => {
      jest.spyOn(jose, 'EncryptJWT').mockImplementation(() => {
        throw new Error('Encryption failed');
      });

      await expect(signToken(mockPayload, mockOptions)).rejects.toThrow('Encryption failed');
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
