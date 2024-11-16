const { Role } = require('../models');
const commonHelpers = require('../helpers/common.helper');
const { sequelize } = require('../models');

async function create(payload) {
  const { name } = payload;
  const transactionContext = await sequelize.transaction();

  try {
    const role = await Role.findOne({ where: { name } });
    if (role) {
      commonHelpers.throwCustomError('Role already exist', 400);
    }
    const newRole = await Role.create(
      { name },
      { transaction: transactionContext },
    );

    return newRole;
  } catch (err) {
    await transactionContext.rollback();
    throw err;
  }
}

async function get(id) {
  const role = await Role.findOne({ where: { id } });
  if (!role) {
    commonHelpers.throwCustomError('Role not found', 404);
  }
  return role;
}

async function getAll() {
  const roles = await Role.findAll();
  return roles;
}

async function update(id, payload) {
  const { name } = payload;
  const transactionContext = await sequelize.transaction();

  try {
    const role = await Role.findOne({ where: { id } });
    role.name = name;
    await role.save({ transaction: transactionContext });

    transactionContext.commit();

    return role;
  } catch (err) {
    await transactionContext.rollback();
    throw err;
  }
}

async function remove(id) {
  const transactionContext = await sequelize.transaction();

  try {
    const role = await Role.findOne({ where: { id } });

    if (!role) {
      commonHelpers.throwCustomError('Role not found', 404);
    }
    await Role.destroy(
      { where: { id: role.id } },
      { transaction: transactionContext },
    );

    return 'Role removed successfully';
  } catch (err) {
    await transactionContext.rollback();
    throw err;
  }
}

module.exports = { create, get, getAll, update, remove };
