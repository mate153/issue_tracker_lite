require('dotenv').config();

const express = require('express');
const corsMiddleware = require('./Middlewares/corsMiddleware');
const logger = require('./Utils/logger');
const routes = require('./routes');
const app = express();

// Middlewares
app.set('trust proxy', true);
app.use(corsMiddleware);
app.use(express.json());

// Route handling
routes.forEach(route => {
  app.use(route.path, route.handler());
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('[Express error]', err);

  if (res.headersSent) return next(err);

  res.status(500).json({
    success: false,
    message: 'An internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

const PORT = process.env.SERVER_PORT || 5000;
app.listen(PORT, () => {
  console.log('|');
  console.log(`|-> ✅ Server started on port ${PORT}`);
  console.log('|');
});
