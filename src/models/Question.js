'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Question.belongsTo(models.Exam, {
        foreignKey: 'exam_id',
        as: 'exams',
      });
    }
  }
  Question.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      exam_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'exams',
          key: 'id',
        },
      },
      question: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('single_choice', 'multiple_choice'),
        defaultValue: 'single_choice',
        allowNull: false,
      },
      negative_marks: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'Question',
      tableName: 'questions',
      paranoid: true,
    },
  );
  return Question;
};
