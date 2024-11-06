const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const startServer = async function () {
	try {
		app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
	} catch (err) {
		console.log('Error runing server', err);
	}
};

startServer();
