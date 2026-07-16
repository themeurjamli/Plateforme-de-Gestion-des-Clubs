const express    = require('express');
const Club       = require('../models/Club.model');
const Membership = require('../models/Membership.model');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { status: 'active' };

    if (category) filter.category = category;
    if (search)   filter.name = { $regex: search, $options: 'i' };

    const clubs = await Club.find(filter)
      .populate('presidentId', 'firstName lastName')
      .populate('membersCount')
      .populate('eventsCount')
      .sort({ createdAt: -1 });

    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/all', protect, authorize('admin'), async (req, res) => {
  try {
    const clubs = await Club.find()
      .populate('presidentId', 'firstName lastName')
      .populate('membersCount')
      .populate('eventsCount')
      .sort({ createdAt: -1 });
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('presidentId', 'firstName lastName email')
      .populate('membersCount')
      .populate('eventsCount');

    if (!club) {
      return res.status(404).json({ message: 'Club introuvable' });
    }
    res.json(club);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { name, description, category } = req.body;

    const existing = await Club.findOne({ presidentId: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'Vous gérez déjà un club' });
    }

    const club = await Club.create({
      name,
      description,
      category,
      presidentId: req.user._id,
      status:      'pending', 
    });

    req.user.role   = 'president';
    req.user.clubId = club._id;
    await req.user.save();

    res.status(201).json(club);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', protect, authorize('president', 'admin'), async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club introuvable' });

    if (
      req.user.role !== 'admin' &&
      club.presidentId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    const { name, description, category } = req.body;
    const updated = await Club.findByIdAndUpdate(
      req.params.id,
      { name, description, category },
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const club = await Club.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!club) return res.status(404).json({ message: 'Club introuvable' });
    res.json(club);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, authorize('president', 'admin'), async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club introuvable' });

    if (
      req.user.role !== 'admin' &&
      club.presidentId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    await club.deleteOne();
    res.json({ message: 'Club supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/members', protect, async (req, res) => {
  try {
    const members = await Membership.find({
      clubId: req.params.id,
      status: 'member',
    }).populate('userId', 'firstName lastName email createdAt');
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/pending', protect, authorize('president', 'admin'), async (req, res) => {
  try {
    const pending = await Membership.find({
      clubId: req.params.id,
      status: 'pending',
    }).populate('userId', 'firstName lastName email');
    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;