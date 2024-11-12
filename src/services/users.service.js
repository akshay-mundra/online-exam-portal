const { User } = require('../models');
const commonHelpers = require('../helpers/common.helper');

async function getAll(currentUser, page = 0) {
  const roles = currentUser.roles;
  const LIMIT = 10;
  const offset = page * LIMIT;
  let users, total;

  // query data according to the logged in user and its role
  if (roles.includes('super_admin')) {
    const { count, rows } = await User.findAndCountAll({
      offset,
      limit: LIMIT,
    });
    users = rows;
    total = count;
  } else if (roles.includes('admin')) {
    const { count, rows } = await User.findAndCountAll({
      where: {
        admin_id: currentUser.id,
      },
      offset,
      limit: LIMIT,
    });
    users = rows;
    total = count;
  }

  return {
    users,
    total,
  };
}

async function get(currentUser, id) {
  const roles = currentUser.roles;

  let user;
  if (roles.includes('super_admin')) {
    user = await User.findByPk(id);
  } else if (roles.includes('admin')) {
    user = await User.findOne({
      where: {
        id: id,
        admin_id: currentUser.id,
      },
    });
  } else if (roles.includes('user') && currentUser.id === id) {
    user = await User.findByPk(id);
  }

  if (!user) {
    commonHelpers.throwCustomError('User not found', 404);
  }

  return {
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
  };
}

async function update(currentUser, id, payload) {
  const { first_name, last_name, email } = payload;

  const [updatedRowCount, updatedUser] = await User.update(
    { first_name, last_name, email },
    {
      where: {
        id,
        admin_id: currentUser.id,
      },
      returning: true,
      plain: true,
    },
  );
  if (updatedRowCount === 0) {
    commonHelpers.throwCustomError('User not found', 404);
  }
  return updatedUser.id;
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
