const { Role } = require('../models');
const commonHelpers = require('../helpers/common.helper');

// create role
async function create(payload) {
  const { name } = payload;

  const role = await Role.findOne({ where: { name } });
  if (role) {
    return commonHelpers.throwCustomError('Role already exist', 400);
  }

  const newRole = await Role.create({ name });

  return newRole;
}

// get role by id
async function get(params) {
  const { id } = params;
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
async function update(params, payload) {
  const { id } = params;
  const { name } = payload;

  const [updatedRowCount, updatedRole] = await Role.update(
    {
      name
    },
    {
      where: { id }
    }
  );

  if (!updatedRowCount) {
    return commonHelpers.throwCustomError('Role not found', 404);
  }

  return updatedRole;
}

// remove role by id
async function remove(params) {
  const { id } = params;

  const role = await Role.findOne({ where: { id } });

  if (!role) {
    return commonHelpers.throwCustomError('Role not found', 404);
  }

  await Role.destroy({ where: { id: role.id } });

  return 'Role removed successfully';
}

module.exports = { create, get, getAll, update, remove };
