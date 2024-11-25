'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserRole extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate() {
      // define association here
    }
  }
  UserRole.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
      },
      role_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
      }
    },
    {
      sequelize,
      modelName: 'UserRole',
      tableName: 'users_roles',
      paranoid: true
    }
  );
  return UserRole;
};
