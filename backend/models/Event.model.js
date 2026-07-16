const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema(
  {
    clubId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Club',
      required: true,
    },
    title: {
      type:     String,
      required: [true, 'Le titre est requis'],
      trim:     true,
    },
    description: { type: String, default: '' },
    location: {
      type:     String,
      required: [true, 'Le lieu est requis'],
    },
    date: {
      type:     Date,
      required: [true, 'La date est requise'],
    },
    time:        { type: String, required: true },
    maxCapacity: { type: Number, default: null },
    visibility: {
      type:    String,
      enum:    ['public', 'members_only'],
      default: 'public',
    },
    status: {
      type:    String,
      enum:    ['upcoming', 'past', 'cancelled'],
      default: 'upcoming',
    },
    coverUrl: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);


EventSchema.virtual('registeredCount', {
  ref:          'EventRegistration',
  localField:   '_id',
  foreignField: 'eventId',
  count:        true,
});

module.exports = mongoose.model('Event', EventSchema);