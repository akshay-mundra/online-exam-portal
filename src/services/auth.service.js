const { User, Role, UserRole } = require('../models');
const commonHelpers = require('../helpers/common.helper');
const bcrypt = require('bcrypt');
const jwtHelpers = require('../helpers/jwt.helper');
const nodemailerHelpers = require('../helpers/nodemailer.helper');

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

async function forgotPassword(payload) {
  const { email } = payload;
  const user = await User.findOne({ where: { email } });
  if (!user) {
    commonHelpers.throwCustomError('User does not exist', 401);
  }
  const token = jwtHelpers.signToken({ id: user.id }, { expiresIn: 600 });

  nodemailerHelpers.sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    message: `${process.env.FRONTEND_URL}/reset-password?token=${token}`,
  });
  console.log(token);
  return 'Password reset link sent to email';
}

async function resetPassword(userId, payload) {
  const { password, confirmPassword } = payload;
  if (confirmPassword !== password) {
    commonHelpers.throwCustomError('Both passwords should match', 422);
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.findOne({
    where: { id: userId },
  });
  if (!user) {
    commonHelpers.throwCustomError('User does not exist', 404);
  }
  user.password = hashedPassword;
  await user.save();

  return 'Password reset successful';
}

async function logout() {
  return 'User logged out successfully!!';
}

module.exports = { register, login, forgotPassword, resetPassword, logout };
