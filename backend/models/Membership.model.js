const mongoose = require('mongoose');

const MembershipSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    clubId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Club',
      required: true,
    },
    status: {
      type:    String,
      enum:    ['pending', 'member', 'banned'],
      default: 'pending',
    },
  },
  { timestamps: true }
);


MembershipSchema.index({ userId: 1, clubId: 1 }, { unique: true });

module.exports = mongoose.model('Membership', MembershipSchema);