const { Role } = require('../models');
const commonHelpers = require('../helpers/common.helper');

async function create(payload) {
  const { name } = payload;
  const role = await Role.findOne({ where: { name } });
  if (role) {
    commonHelpers.throwCustomError('Role already exist', 400);
  }
  const newRole = await Role.create({ name });
  console.log(newRole);
  return newRole;
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
  const role = await Role.findOne({ where: { id } });
  role.name = name;
  await role.save();
  return role;
}

async function remove(id) {
  const role = await Role.findOne({ where: { id } });
  if (!role) {
    commonHelpers.throwCustomError('Role not found', 404);
  }
  await Role.destroy({ where: { id: role.id } });
  return 'Role removed successfully';
}

module.exports = { create, get, getAll, update, remove };
