const express = require('express');
const Event   = require('../models/Event.model');
const { EventRegistration } = require('../models/Poll.model');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { clubId } = req.query;
    const filter = { status: 'upcoming', visibility: 'public' };
    if (clubId) filter.clubId = clubId;

    const events = await Event.find(filter)
      .populate('clubId', 'name')
      .populate('registeredCount')
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/club/:clubId', protect, async (req, res) => {
  try {
    const events = await Event.find({ clubId: req.params.clubId })
      .populate('registeredCount')
      .sort({ date: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('clubId', 'name')
      .populate('registeredCount');
    if (!event) return res.status(404).json({ message: 'Événement introuvable' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, authorize('president', 'admin'), async (req, res) => {
  try {
    const { clubId, title, description, location, date, time, maxCapacity, visibility } = req.body;
    const event = await Event.create({
      clubId, title, description, location, date, time, maxCapacity, visibility,
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', protect, authorize('president', 'admin'), async (req, res) => {
  try {
    const { title, description, location, date, time, maxCapacity, visibility } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { title, description, location, date, time, maxCapacity, visibility },
      { new: true, runValidators: true }
    );
    if (!event) return res.status(404).json({ message: 'Événement introuvable' });
    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, authorize('president', 'admin'), async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Événement supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/register', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('registeredCount');
    if (!event) return res.status(404).json({ message: 'Événement introuvable' });

    if (event.maxCapacity && event.registeredCount >= event.maxCapacity) {
      return res.status(400).json({ message: "L'événement est complet" });
    }

    const reg = await EventRegistration.create({
      eventId: req.params.id,
      userId:  req.user._id,
    });

    res.status(201).json(reg);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Vous êtes déjà inscrit' });
    }
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id/register', protect, async (req, res) => {
  try {
    await EventRegistration.findOneAndDelete({
      eventId: req.params.id,
      userId:  req.user._id,
    });
    res.json({ message: 'Désinscription effectuée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/registrations', protect, authorize('president', 'admin'), async (req, res) => {
  try {
    const regs = await EventRegistration.find({ eventId: req.params.id })
      .populate('userId', 'firstName lastName email');
    res.json(regs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;