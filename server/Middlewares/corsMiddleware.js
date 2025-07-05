const cors = require('cors');
require('dotenv').config();

const allowedOrigins = [
  process.env.CLIENT_ADDRESS,
  process.env.ADMIN_CLIENT_ADDRESS
];

const corsMiddleware = cors({
  origin: allowedOrigins,
  credentials: true
});

module.exports = corsMiddleware;