'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Option extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Option.belongsTo(models.Question, {
        foreignKey: 'question_id',
        as: 'questions',
      });
    }
  }
  Option.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      question_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'questions',
          key: 'id',
        },
      },
      option: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_correct: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      marks: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'Option',
      tableName: 'options',
      paranoid: true,
    },
  );
  return Option;
};
