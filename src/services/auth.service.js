const { User, Role, UserRole } = require('../models');
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

async function register(req, payload) {
  const { first_name, last_name, email, password, roles: userRoles } = payload;

  const userExists = await User.findOne({ where: { email } });
  if (userExists) {
    commonHelpers.throwCustomError('user already exist', 400);
  }

  // match role names with db roles
  const roles = await Role.findAll();
  const roleNames = roles.map(role => role.name);
  if (!userRoles?.every(role => roleNames.includes(role))) {
    commonHelpers.throwCustomError('Invalid role', 422);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  let admin_id = null;
  if (['admin', 'super_admin'].some(role => req?.user?.roles?.includes(role))) {
    admin_id = req.user.id;
  }
  const userData = {
    first_name,
    last_name,
    email,
    password: hashedPassword,
    admin_id,
  };
  const user = await User.create(userData);

  const userRoleIds = userRoles.map(roleName => {
    const role = roles.find(role => role.name === roleName);
    return role.id;
  });
  await Promise.all(
    userRoleIds.map(roleId =>
      UserRole.create({ user_id: user.id, role_id: roleId }),
    ),
  );

  return user.id;
}

module.exports = { register, login };
