'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Answer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Answer.belongsTo(models.Question, {
        foreignKey: 'question_id',
        as: 'questions',
      });

      Answer.belongsTo(models.Option, {
        foreignKey: 'option_id',
        as: 'options',
      });

      Answer.belongsTo(models.UserExam, {
        foreignKey: 'user_exam_id',
        as: 'users_exams',
      });
    }
  }
  Answer.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      option_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'options',
          key: 'id',
        },
      },
      question_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'questions',
          key: 'id',
        },
      },
      user_exam_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users_exams',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      modelName: 'Answer',
      tableName: 'answers',
      paranoid: true,
    },
  );
  return Answer;
};
