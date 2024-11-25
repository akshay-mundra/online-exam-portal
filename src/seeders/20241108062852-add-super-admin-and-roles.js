'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [roles] = await queryInterface.bulkInsert(
      'roles',
      [
        {
          name: 'super_admin'
        },
        {
          name: 'admin'
        },
        {
          name: 'user'
        }
      ],
      { returning: ['id'] }
    );

    const [super_admin] = await queryInterface.bulkInsert(
      'users',
      [
        {
          first_name: 'Akshay',
          last_name: 'Mundra',
          email: 'akshay.mundra1010@gmail.com',
          password: await bcrypt.hash(process.env.SUPER_ADMIN_PASS, 10)
        }
      ],
      { returning: ['id'] }
    );

    const super_admin_role_id = roles.id;
    const admin_id = super_admin.id;

    await queryInterface.bulkInsert('users_roles', [
      {
        user_id: admin_id,
        role_id: super_admin_role_id
      }
    ]);
  },

  async down() {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
