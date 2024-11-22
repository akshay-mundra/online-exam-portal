const jwt = require('jsonwebtoken');

// sign jwt token
function signToken(
  payload,
  options = { expiresIn: process.env.JWT_EXPIRE_IN },
) {
  return jwt.sign(payload, process.env.JWT_SECRET, options);
}

// verify the jwt token
function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
module.exports = { signToken, verifyToken };
