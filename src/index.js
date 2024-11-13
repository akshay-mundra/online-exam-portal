const express = require('express');
const { sequelize } = require('./models');
const { redisClient } = require('./config/redis.js');
const { registerRoutes } = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

registerRoutes(app);

const startServer = async function () {
  try {
    await sequelize.authenticate();
    console.log('Db Connected Successfully!');

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.log('Error runing server', err);
  }
};

startServer();
