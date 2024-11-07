require('dotenv').config({ path: __dirname + '/../../.env' });

module.exports = {
  development: {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    define: {
      paranoid: true,
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    },
  },
  test: {
    host: '',
    dialect: '',
    username: '',
    password: '',
    database: '',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    define: {
      paranoid: true,
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    },
  },
};
