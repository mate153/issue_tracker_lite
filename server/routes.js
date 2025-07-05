const authRoutes = require('./Controllers/authController');
const ticketController = require('./Controllers/ticketController');
const titleGeneratorController = require('./Controllers/titleGeneratorController');

const routes = [
  {
    path: '/api/auth',
    handler: authRoutes,
  },
  {
    path: '/api/tickets',
    handler: ticketController,
  },
  {
    path: '/api/title_generator',
    handler: titleGeneratorController,
  }
];

module.exports = routes;