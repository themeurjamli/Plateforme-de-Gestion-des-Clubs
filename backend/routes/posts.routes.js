const express = require('express');
const Post    = require('../models/Post.model');
const Club    = require('../models/Club.model');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/club/:clubId', async (req, res) => {
  try {
    const posts = await Post.find({ clubId: req.params.clubId })
      .populate('authorId', 'firstName lastName')
      .populate('clubId',   'name')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('authorId', 'firstName lastName')
      .populate('clubId',   'name category')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('authorId', 'firstName lastName')
      .populate('clubId',   'name category');
    if (!post) return res.status(404).json({ message: 'Article introuvable' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, authorize('president', 'admin'), async (req, res) => {
  try {
    const { clubId, title, content, coverImage, tags } = req.body;

    if (req.user.role === 'president') {
      const club = await Club.findById(clubId);
      if (!club) return res.status(404).json({ message: 'Club introuvable' });
      if (club.presidentId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Vous n\'êtes pas le président de ce club' });
      }
    }

    const post = await Post.create({
      clubId,
      authorId: req.user._id,
      title,
      content,
      coverImage: coverImage || '',
      tags:       tags || [],
    });

    const populated = await Post.findById(post._id)
      .populate('authorId', 'firstName lastName')
      .populate('clubId',   'name');

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', protect, authorize('president', 'admin'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Article introuvable' });

    if (
      req.user.role !== 'admin' &&
      post.authorId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    const { title, content, coverImage, tags } = req.body;
    const updated = await Post.findByIdAndUpdate(
      req.params.id,
      { title, content, coverImage, tags },
      { new: true, runValidators: true }
    )
      .populate('authorId', 'firstName lastName')
      .populate('clubId',   'name');

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, authorize('president', 'admin'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Article introuvable' });

    if (
      req.user.role !== 'admin' &&
      post.authorId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    await post.deleteOne();
    res.json({ message: 'Article supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;