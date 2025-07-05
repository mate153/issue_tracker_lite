const authRoutes = require('./Controllers/authController');
const ticketController = require('./Controllers/ticketController');

const routes = [
  {
    path: '/api/auth',
    handler: authRoutes,
  },
  {
    path: '/api/tickets',
    handler: ticketController,
  }
];

module.exports = routes;