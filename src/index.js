const express = require('express');
const { sequelize } = require('./models');
const { registerRoutes } = require('./routes');
require('./schedulers');
const swaggerUi = require('swagger-ui-express');
const { swaggerDocument } = require('./swagger/swagger');
const requestIp = require('request-ip');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(requestIp.mw()); // get client ip

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

registerRoutes(app);

const startServer = async function () {
  try {
    await sequelize.authenticate();
    console.log('Db Connected Successfully!');

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.log('Error runing server', error);
  }
};

startServer();
