const { Role } = require('../models');
const commonHelpers = require('../helpers/common.helper');
const { sequelize } = require('../models');

// create role
async function create(payload) {
  const { name } = payload;
  const transactionContext = await sequelize.transaction();

  try {
    const role = await Role.findOne({ where: { name } });
    if (role) {
      return commonHelpers.throwCustomError('Role already exist', 400);
    }
    const newRole = await Role.create(
      { name },
      { transaction: transactionContext },
    );

    await transactionContext.commit();

    return newRole;
  } catch (err) {
    await transactionContext.rollback();
    throw err;
  }
}

// get role by id
async function get(id) {
  const role = await Role.findOne({ where: { id } });
  if (!role) {
    return commonHelpers.throwCustomError('Role not found', 404);
  }
  return role;
}

// get all roles
async function getAll() {
  const roles = await Role.findAll();
  return roles;
}

// update role by id
async function update(id, payload) {
  const { name } = payload;
  const transactionContext = await sequelize.transaction();

  try {
    const [updatedRowCount, updatedRole] = await Role.update(
      {
        name,
      },
      {
        where: { id },
      },
      {
        transaction: transactionContext,
      },
    );
    if (!updatedRowCount) {
      return commonHelpers.throwCustomError('Role not found', 404);
    }

    await transactionContext.commit();

    return updatedRole;
  } catch (err) {
    await transactionContext.rollback();
    throw err;
  }
}

// remove role by id
async function remove(id) {
  const transactionContext = await sequelize.transaction();

  try {
    const role = await Role.findOne({ where: { id } });

    if (!role) {
      return commonHelpers.throwCustomError('Role not found', 404);
    }
    await Role.destroy(
      { where: { id: role.id } },
      { transaction: transactionContext },
    );

    await transactionContext.commit();

    return 'Role removed successfully';
  } catch (err) {
    await transactionContext.rollback();
    throw err;
  }
}

module.exports = { create, get, getAll, update, remove };
