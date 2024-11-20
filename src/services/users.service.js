const { User, UserRole, Role, Exam } = require('../models');
const commonHelpers = require('../helpers/common.helper');
const { sequelize } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

async function getAll(currentUser, page = 0) {
  const roles = currentUser.roles;
  const { limit, offset } = commonHelpers.getPaginationAttributes(page);
  const { isSuperAdmin } = commonHelpers.getRolesAsBool(roles);

  // query data according to the logged in user and its role
  const options = {
    where: isSuperAdmin ? {} : { admin_id: currentUser.id },
    attributes: ['id', 'first_name', 'last_name', 'email', 'admin_id'],
    offset,
    limit,
  };
  const { count: total, rows: users } = await User.findAndCountAll(options);

  return {
    users,
    total,
  };
}

// admin can get users created by him, user can only see details of self.
async function get(currentUser, id) {
  const roles = currentUser.roles;
  const { isSuperAdmin, isUser, isAdmin } = commonHelpers.getRolesAsBool(roles);

  let user;
  const options = {
    where: isSuperAdmin || isAdmin ? { id } : { id, admin_id: currentUser.id },
  };

  if (isSuperAdmin || isAdmin) {
    user = await User.findOne(options);
  } else if (isUser && currentUser.id === id) {
    user = await User.findByPk(options);
  }
  if (!user) {
    commonHelpers.throwCustomError('User not found', 404);
  }

  return {
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
  };
}

// update user if user created by admin or the current user is superadmin
async function update(currentUser, id, payload) {
  const { firstName, lastName, email } = payload;
  const roles = currentUser.roles;
  const { isSuperAdmin } = commonHelpers.getRolesAsBool(roles);

  const transactionContext = await sequelize.transaction();

  try {
    const options = {
      where: isSuperAdmin
        ? { id }
        : {
            id,
            admin_id: currentUser.id,
          },
      returning: ['id', 'first_name', 'last_name', 'email', 'admin_id'],
      transaction: transactionContext,
    };

    const [updatedRowCount, updatedUser] = await User.update(
      { first_name: firstName, last_name: lastName, email },
      options,
    );
    if (updatedRowCount === 0) {
      commonHelpers.throwCustomError('User not found', 404);
    }
    await transactionContext.commit();

    return updatedUser;
  } catch (err) {
    await transactionContext.rollback();
    throw err;
  }
}

// remove user (only by admin and superadmin)
async function remove(currentUser, id) {
  const roles = currentUser.roles;
  const { isSuperAdmin } = commonHelpers.getRolesAsBool(roles);

  const transactionContext = await sequelize.transaction();
  try {
    const options = {
      where: isSuperAdmin ? { id } : { id, admin_id: currentUser.id },
      transaction: transactionContext,
    };
    const countChanged = await User.destroy(options);
    if (countChanged === 0) {
      commonHelpers.throwCustomError('User not found', 404);
    }
    await transactionContext.commit();

    return { count: countChanged, message: 'User removed successfully' };
  } catch (err) {
    await transactionContext.rollback();
    throw err;
  }
}

async function bulkCreate(currentUser, payload) {
  const { users } = payload;
  const transactionContext = await sequelize.transaction();

  try {
    const bulkUsers = [];
    const userRole = await Role.findOne({ where: { name: 'user' } });

    for (let user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      const userObj = {
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
        password: hashedPassword,
        admin_id: currentUser.id,
      };

      const userExists = await User.findOne({
        where: { [Op.or]: [{ id: user.id }, { email: user.email }] },
      });

      if (userExists) {
        if (userExists.admin_id !== currentUser.id) {
          commonHelpers.throwCustomError(
            'The user you are updating is not created by you',
            403,
          );
        }
        const updatedUser = await User.update(
          userObj,
          {
            where: { id: userExists.id },
            returning: true,
            plain: true,
          },
          { transaction: transactionContext },
        );

        bulkUsers.push(updatedUser[1].id);
      } else {
        const createdUser = await User.create(userObj, {
          transaction: transactionContext,
        });

        await UserRole.create(
          {
            user_id: createdUser.id,
            role_id: userRole.id,
          },
          {
            transaction: transactionContext,
          },
        );

        bulkUsers.push(createdUser.id);
      }
    }

    await transactionContext.commit();

    return bulkUsers;
  } catch (err) {
    await transactionContext.rollback();
    throw err;
  }
}

async function getAllExams(currentUser, params) {
  const { id } = params;
  const roles = currentUser.roles;
  const { isAdmin, isUser } = commonHelpers.getRolesAsBool(roles);

  const options = {
    where: isUser ? {} : { admin_id: currentUser.id },
    include: [
      {
        model: User,
        where: isUser ? { id } : { admin_id: currentUser.id, id },
        attributes: ['id'],
        required: true,
        through: {
          attributes: [],
          where: { deleted_at: null },
        },
      },
    ],
  };

  let exams;
  if (isAdmin) {
    exams = await Exam.findAll(options);
  } else if (isUser) {
    if (id !== currentUser.id) {
      commonHelpers.throwCustomError(
        'Other user is not accessible to you',
        403,
      );
    }

    exams = await Exam.findAll(options);
  }

  return exams;
}

module.exports = { getAll, get, update, remove, bulkCreate, getAllExams };
