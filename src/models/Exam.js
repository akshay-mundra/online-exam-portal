'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Exam extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Exam.belongsTo(models.User, {
        as: 'admin',
        foreignKey: 'admin_id',
      });

      Exam.belongsToMany(models.User, {
        through: 'users_exams',
        foreignKey: 'exam_id',
        other_key: 'user_id',
      });

      Exam.hasMany(models.Question, {
        foreignKey: 'exam_id',
      });
    }
  }
  Exam.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      admin_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_published: {
        type: DataTypes.BOOLEAN,
        defaultValue: 'false',
      },
      start_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Exam',
      tableName: 'exams',
      paranoid: true,
    },
  );
  return Exam;
};
