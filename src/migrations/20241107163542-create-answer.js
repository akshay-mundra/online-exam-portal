'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('answers', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()')
      },
      option_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'options',
          key: 'id'
        }
      },
      question_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'questions',
          key: 'id'
        }
      },
      user_exam_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users_exams',
          key: 'id'
        }
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('answers');
  }
};
