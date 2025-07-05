const express = require('express');
const router = express.Router();
const authService = require('../Services/authService');
const logger = require('../Utils/logger');

// Registration
router.post('/register', async (req, res) => {
  try {    
    const result = await authService.registerUser(req.body);
    res.status(201).json({ message: result });
  } catch (err) {
    logger.error('[REGISTER] Failed:', err);
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const result = await authService.loginUser(req.body);
    res.status(200).json( result );
  } catch (err) {
    logger.error('[LOGIN] Failed:', err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = () => router;
