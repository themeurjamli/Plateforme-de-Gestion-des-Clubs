const mongoose = require('mongoose');

const ClubSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Le nom du club est requis'],
      trim:     true,
      unique:   true,
    },
    description: {
      type:     String,
      required: [true, 'La description est requise'],
    },
    category: {
      type: String,
      enum: ['Tech', 'Sport', 'Culture', 'Musique', 'Science', 'Art', 'Autre'],
      required: true,
    },
    status: {
      type:    String,
      enum:    ['pending', 'active', 'inactive', 'rejected'],
      default: 'pending', 
    },
    presidentId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    logoUrl: {
      type:    String,
      default: '',
    },
    gallery: [
      {
        url: {
          type:     String,
          required: [true, 'URL de la photo est requise'],
        },
        caption: {
          type:    String,
          default: '',
        },
        uploadedAt: {
          type:    Date,
          default: Date.now,
        },
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref:  'User',
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);


ClubSchema.virtual('membersCount', {
  ref:          'Membership',
  localField:   '_id',
  foreignField: 'clubId',
  count:        true,
  match:        { status: 'member' },
});

ClubSchema.virtual('eventsCount', {
  ref:          'Event',
  localField:   '_id',
  foreignField: 'clubId',
  count:        true,
});

module.exports = mongoose.model('Club', ClubSchema);