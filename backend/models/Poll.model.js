const mongoose = require('mongoose');


const PollOptionSchema = new mongoose.Schema({
  label:      { type: String, required: true },
  votesCount: { type: Number, default: 0 },
});


const PollSchema = new mongoose.Schema(
  {
    clubId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Club',
      required: true,
    },
    question: {
      type:     String,
      required: [true, 'La question est requise'],
    },
    options: {
      type:     [PollOptionSchema],
      validate: {
        validator: (v) => v.length >= 2,
        message:   'Un sondage doit avoir au moins 2 options',
      },
    },
    status: {
      type:    String,
      enum:    ['active', 'closed'],
      default: 'active',
    },
    closedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const PollVoteSchema = new mongoose.Schema(
  {
    pollId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Poll',   required: true },
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
    optionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);


PollVoteSchema.index({ pollId: 1, userId: 1 }, { unique: true });

const EventRegistrationSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
  },
  { timestamps: true }
);


EventRegistrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });

module.exports = {
  Poll:              mongoose.model('Poll', PollSchema),
  PollVote:          mongoose.model('PollVote', PollVoteSchema),
  EventRegistration: mongoose.model('EventRegistration', EventRegistrationSchema),
};