const { Pool } = require('pg');
const logger = require('../../Utils/logger');

const pool = new Pool({
  user: process.env.DB_ADMIN_USER,
  host: process.env.DB_HOSTNAME,
  database: process.env.DATABASE,
  password: process.env.DB_ADMIN_PASSWORD,
  port: process.env.DB_SERVER_PORT,
});

pool.connect()
  .then(client => {
    console.log('|');
    console.log('|-> ✅ Connection to database is successful!');
    console.log('|');
    client.release();
  })
  .catch(err => {
    console.log('|');
    console.log('|-> ❌ Connection to the database failed!', err);
    console.log('|');
    logger.error('[DB Connect] Connection to the database failed:', err);
  });

const query = (text, params) => pool.query(text, params);

module.exports = {
  query,
  pool,
  connect: () => pool.connect(),
};
