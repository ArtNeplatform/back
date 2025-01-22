const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Hello, CICD World!'));
app.get('/health', (req, res) => res.status(200).send({ status: 'UP' }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
