const { User } = require('../models');
const commonHelpers = require('../helpers/common.helper');

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
