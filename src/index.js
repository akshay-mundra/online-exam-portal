const express = require('express');
const { sequelize } = require('./models');
const { redisClient } = require('./config/redis.js');
const { registerRoutes } = require('./routes');
require('./schedulers');
const swaggerUi = require('swagger-ui-express');
const { swaggerDocument } = require('./swagger/swagger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

registerRoutes(app);

const startServer = async function () {
  try {
    await sequelize.authenticate();
    console.log('Db Connected Successfully!');
    const data = await redisClient.get('name');
    console.log(data);
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.log('Error runing server', err);
  }
};

startServer();
