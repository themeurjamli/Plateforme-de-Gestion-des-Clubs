const express = require('express');
const User    = require('../models/User.model');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/users — Tous les utilisateurs (admin) ───────────
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── GET /api/users/:id — Un utilisateur ──────────────────────
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── PATCH /api/users/:id — Modifier rôle ou statut (admin) ───
router.patch('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { role, status } = req.body;
    const updateData = {};
    if (role)   updateData.role   = role;
    if (status) updateData.status = status;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;