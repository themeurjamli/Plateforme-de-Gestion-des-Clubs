const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    clubId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Club',
      required: true,
    },
    authorId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    title: {
      type:     String,
      required: [true, 'Le titre est requis'],
      trim:     true,
    },
    content: {
      type:     String,
      required: [true, 'Le contenu est requis'],
    },
    coverImage: {
      type:    String,
      default: '',
    },
    tags: {
      type:    [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', PostSchema);