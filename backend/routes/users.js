const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/roleCheck');

function sanitizeUser(user) {
  if (!user) return user;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

// Get all users — managers only
router.get('/', authenticateToken, authorizeRoles('manager'), async (req, res) => {
  try {
    const users = await User.find();
    res.json(users.map(sanitizeUser));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get delivery users
router.get('/delivery', authenticateToken, authorizeRoles('manager'), async (req, res) => {
  try {
    const deliveryUsers = await User.find({ role: 'delivery' });
    res.json(deliveryUsers.map(sanitizeUser));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch delivery users' });
  }
});

module.exports = router;
