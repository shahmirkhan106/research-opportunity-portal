const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
