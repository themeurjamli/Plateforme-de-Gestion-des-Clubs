const express = require('express');
const { Poll, PollVote } = require('../models/Poll.model');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/club/:clubId', protect, async (req, res) => {
  try {
    const polls = await Poll.find({ clubId: req.params.clubId }).sort({ createdAt: -1 });
    res.json(polls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, authorize('president', 'admin'), async (req, res) => {
  try {
    const { clubId, question, options } = req.body;

    const poll = await Poll.create({
      clubId,
      question,
      options: options.map((label) => ({ label, votesCount: 0 })),
    });

    res.status(201).json(poll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/:id/vote', protect, async (req, res) => {
  try {
    const { optionId } = req.body;

    const poll = await Poll.findById(req.params.id);
    if (!poll)                    return res.status(404).json({ message: 'Sondage introuvable' });
    if (poll.status === 'closed') return res.status(400).json({ message: 'Ce sondage est clôturé' });

    await PollVote.create({ pollId: poll._id, userId: req.user._id, optionId });
    await Poll.findOneAndUpdate(
      { _id: poll._id, 'options._id': optionId },
      { $inc: { 'options.$.votesCount': 1 } }
    );

    const updated = await Poll.findById(poll._id);
    res.json(updated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Vous avez déjà voté' });
    }
    res.status(400).json({ message: error.message });
  }
});

router.patch('/:id/close', protect, authorize('president', 'admin'), async (req, res) => {
  try {
    const poll = await Poll.findByIdAndUpdate(
      req.params.id,
      { status: 'closed', closedAt: new Date() },
      { new: true }
    );
    res.json(poll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, authorize('president', 'admin'), async (req, res) => {
  try {
    await Poll.findByIdAndDelete(req.params.id);
    await PollVote.deleteMany({ pollId: req.params.id });
    res.json({ message: 'Sondage supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;