const { User, Role } = require('../models');
const commonHelpers = require('../helpers/common.helper');
const bcrypt = require('bcrypt');
const jwtHelpers = require('../helpers/jwt.helper');

async function login(payload) {
  const { email, password } = payload;

  let user = await User.findOne({
    where: { email },
    include: [
      {
        model: Role,
        attributes: ['name'],
        through: { attributes: [] },
      },
    ],
  });

  if (!user) {
    return commonHelpers.throwCustomError(
      'User with email does not exist',
      401,
    );
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    return commonHelpers.throwCustomError('Invalid email or password', 403);
  }

  const roles = user.Roles.map(role => role.name);
  const token = jwtHelpers.signToken({
    id: user.id,
    email: user.email,
    roles,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      roles,
    },
    token,
  };
}

async function register() {
  return 'users registerd successfully';
}

module.exports = { register, login };
