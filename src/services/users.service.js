const { User } = require('../models');
const commonHelpers = require('../helpers/common.helper');
const { sequelize } = require('../models');

async function getAll(currentUser, page = 0) {
  const LIMIT = 10;
  const offset = page * LIMIT;
  const roles = currentUser.roles;
  // query data according to the logged in user and its role
  const options = {
    where: roles.includes('super_admin') ? {} : { admin_id: currentUser.id },
    attributes: ['id', 'first_name', 'last_name', 'email', 'admin_id'],
    offset,
    limit: LIMIT,
  };
  const { count: total, rows: users } = await User.findAndCountAll(options);

  return {
    users,
    total,
  };
}

async function get(currentUser, id) {
  const roles = currentUser.roles;
  let user;
  const options = {
    where:
      roles.includes('super_admin') || roles.includes('user')
        ? { id }
        : { id, admin_id: currentUser.id },
  };
  if (roles.includes('super_admin') || roles.includes('admin')) {
    user = await User.findOne(options);
  } else if (roles.includes('user') && currentUser.id === id) {
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

async function update(currentUser, id, payload) {
  const { firstName, lastName, email } = payload;
  const transactionContext = await sequelize.transaction();
  const roles = currentUser.roles;

  try {
    const options = {
      where: roles.includes('super_admin')
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

async function remove(currentUser, id) {
  const countChanged = await User.destroy({
    where: {
      id,
      admin_id: currentUser.id,
    },
  });
  if (countChanged === 0) {
    commonHelpers.throwCustomError('User not found', 404);
  }

  return { count: countChanged, message: 'User removed successfully' };
}

module.exports = { getAll, get, update, remove };
