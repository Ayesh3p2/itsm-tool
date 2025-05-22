const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Ticket = require('../models/Ticket');

// Get all users (admin only)
router.get('/users', [auth, admin], async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Create new user (admin only)
router.post('/users', [auth, admin], async (req, res) => {
  try {
    const { name, email, role } = req.body;
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      email,
      role,
    });

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Delete user (admin only)
router.delete('/users/:id', [auth, admin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    await user.remove();
    res.json({ msg: 'User removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Get all tickets (admin only)
router.get('/tickets', [auth, admin], async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Admin middleware
function admin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Admin access required' });
  }
  next();
}

module.exports = router;
