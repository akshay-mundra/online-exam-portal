const jose = require('jose');

const secret = jose.base64url.decode(process.env.JWT_SECRET);

async function signToken(payload, options = { expiresIn: process.env.JWT_EXPIRE_IN }) {
  const jwt = await new jose.EncryptJWT(payload)
    .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
    .setIssuedAt()
    .setExpirationTime(options.expiresIn)
    .encrypt(secret);

  return jwt;
}

async function verifyToken(token) {
  const { payload } = await jose.jwtDecrypt(token, secret);
  return payload;
}

module.exports = { signToken, verifyToken };
