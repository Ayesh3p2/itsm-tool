const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Ticket = require('../models/Ticket');

// Create new ticket
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, type, priority } = req.body;
        const ticket = await Ticket.create({
            title,
            description,
            type,
            priority,
            createdBy: req.user.id
        });

        res.json(ticket);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Get user's tickets
router.get('/', [auth], async (req, res) => {
    try {
        const tickets = await Ticket.find({ createdBy: req.user.id });
        res.json(tickets);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Get ticket by ID
router.get('/:id', [auth], async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ msg: 'Ticket not found' });
        }

        res.json(ticket);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
