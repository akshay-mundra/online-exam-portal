const { User, Role, UserRole } = require('../models');
const commonHelpers = require('../helpers/common.helper');
const bcrypt = require('bcrypt');
const jwtHelpers = require('../helpers/jwt.helper');
const nodemailerHelpers = require('../helpers/nodemailer.helper');
const { sequelize } = require('../models');
const { Op } = require('sequelize');
const { redisClient } = require('../config/redis');
const crypto = require('crypto');
const { SUPER_ADMIN, ADMIN } = require('../constants/common.constant');

// login user by email and password
async function login(payload) {
  const { email, password } = payload;

  const user = await User.findOne({
    where: { email },
    include: [
      {
        model: Role,
        attributes: ['name'],
        through: { attributes: [] }
      }
    ]
  });

  if (!user) {
    return commonHelpers.throwCustomError('User with email does not exist', 401);
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    return commonHelpers.throwCustomError('Invalid email or password', 403);
  }

  const roles = user.Roles.map(role => role.name);

  const token = await jwtHelpers.signToken({
    id: user.id,
    email: user.email,
    roles
  });

  return {
    user: {
      id: user.id,
      roles
    },
    token
  };
}

// register new user
async function register(req, payload) {
  const { firstName, lastName, email, password, roles: userRoles } = payload;

  const transactionContext = await sequelize.transaction();

  try {
    const userExists = await User.findOne({ where: { email } });

    if (userExists) return commonHelpers.throwCustomError('User already exists', 409);

    const roles = await Role.findAll({
      where: {
        name: { [Op.in]: userRoles }
      }
    });

    const roleNames = new Set(roles.map(role => role.name));

    if (userRoles.some(role => !roleNames.has(role))) {
      return commonHelpers.throwCustomError('Invalid roles', 422);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin_id = [ADMIN, SUPER_ADMIN].some(role => req?.user?.roles?.includes(role)) ? req.user.id : null;

    const user = await User.create(
      {
        first_name: firstName,
        last_name: lastName,
        email,
        password: hashedPassword,
        admin_id
      },
      { transaction: transactionContext }
    );

    const userRoleIds = roles.map(role => ({
      user_id: user.id,
      role_id: role.id
    }));

    await UserRole.bulkCreate(userRoleIds, { transaction: transactionContext });

    await transactionContext.commit();

    return 'User created successfully';
  } catch (error) {
    await transactionContext.rollback();
    throw error;
  }
}

// send token to user for password reset
async function forgotPassword(payload) {
  const { email } = payload;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return commonHelpers.throwCustomError('User does not exist', 401);
  }

  const key = `reset-token:${user?.id}`;

  const token = await redisClient.get(key);
  if (token) {
    await redisClient.del(key);
  }
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = await bcrypt.hash(resetToken, 10);

  await redisClient.set(key, hashedToken, 'EX', 60);

  nodemailerHelpers.sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    message: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&id=${user.id}`
  });

  console.log('reset token', resetToken); // temp
  console.log('userId', user.id); // temp
  return {
    message: 'Password reset link sent to email'
  };
}

// reset passwword by verifying token and updating to new password
async function resetPassword(payload) {
  const { password, confirmPassword, token, userId } = payload;
  const transactionContext = await sequelize.transaction();

  try {
    if (confirmPassword !== password) {
      return commonHelpers.throwCustomError('Both passwords should match', 422);
    }

    const user = await User.findOne({
      where: { id: userId }
    });

    if (!user) {
      return commonHelpers.throwCustomError('User does not exist', 404);
    }

    const key = `reset-token:${user.id}`;
    const resetToken = await redisClient.get(key);

    if (!resetToken) {
      return commonHelpers.throwCustomError('Invalid or expired reset token', 401);
    }

    const isValid = await bcrypt.compare(token, resetToken);

    if (!isValid) {
      return commonHelpers.throwCustomError('Invalid token', 401);
    }

    redisClient.del(key);

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    await user.save({ transaction: transactionContext });
    await transactionContext.commit();

    return 'Password reset successful';
  } catch (error) {
    await transactionContext.rollback();
    throw error;
  }
}

// logout user
async function logout() {
  return 'User logged out successfully!!';
}

module.exports = { register, login, forgotPassword, resetPassword, logout };
