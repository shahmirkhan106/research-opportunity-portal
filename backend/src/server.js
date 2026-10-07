require('dotenv').config();

const app = require('./app');
const { checkConnection } = require('./config/db');

const PORT = process.env.PORT || 3000;

checkConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
});
