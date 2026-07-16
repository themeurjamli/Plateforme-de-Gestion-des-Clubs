const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type:     String,
      required: [true, 'Le prénom est requis'],
      trim:     true,
    },
    lastName: {
      type:     String,
      required: [true, 'Le nom est requis'],
      trim:     true,
    },
    email: {
      type:      String,
      required:  [true, "L'email est requis"],
      unique:    true,
      lowercase: true,
      trim:      true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Format email invalide',
      ],
    },
    password: {
      type:     String,
      required: [true, 'Le mot de passe est requis'],
      minlength: [8, 'Minimum 8 caractères'],
      select:   false, 
    },
    role: {
      type:    String,
      enum:    ['visitor', 'member', 'president', 'admin'],
      default: 'member',
    },
    status: {
      type:    String,
      enum:    ['active', 'banned'],
      default: 'active',
    },
    bio:       { type: String, default: '' },
    interests: { type: [String], default: [] },
    avatarUrl: { type: String, default: '' },
    clubId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Club', default: null },
  },
  {
    timestamps: true, 
  }
);


UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);