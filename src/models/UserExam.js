'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserExam extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      UserExam.hasMany(models.Answer, {
        foreignKey: 'user_exam_id'
      });
    }
  }
  UserExam.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      exam_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'exams',
          key: 'id'
        }
      },
      is_marked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'on-going', 'completed'),
        defaultValue: 'pending'
      },
      score: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'UserExam',
      tableName: 'users_exams',
      paranoid: true
    }
  );
  return UserExam;
};
