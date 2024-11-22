const YAML = require('yamljs');
const path = require('path');

const filePath = path.join(__dirname, './main.yaml');

const swaggerDocument = YAML.load(filePath);

module.exports = { swaggerDocument };
