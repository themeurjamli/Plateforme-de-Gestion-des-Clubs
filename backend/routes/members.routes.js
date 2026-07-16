const express    = require('express');
const Membership = require('../models/Membership.model');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { clubId } = req.body;

    const existing = await Membership.findOne({
      userId: req.user._id,
      clubId,
    });
    if (existing) {
      return res.status(400).json({ message: 'Vous avez déjà une demande pour ce club' });
    }

    const membership = await Membership.create({
      userId: req.user._id,
      clubId,
      status: 'pending',
    });

    res.status(201).json(membership);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/me', protect, async (req, res) => {
  try {
    const memberships = await Membership.find({ userId: req.user._id })
      .populate('clubId', 'name category description status');
    res.json(memberships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id', protect, authorize('president', 'admin'), async (req, res) => {
  try {
    const { status } = req.body; // 'member' ou suppression

    const membership = await Membership.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('userId', 'firstName lastName email');

    if (!membership) {
      return res.status(404).json({ message: 'Adhésion introuvable' });
    }

    res.json(membership);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, authorize('president', 'admin'), async (req, res) => {
  try {
    await Membership.findByIdAndDelete(req.params.id);
    res.json({ message: 'Membre retiré' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;