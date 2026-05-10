// Codex, GPT-5.5 High, OpenAI.
const crypto = require('crypto');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'customer'
  },
  settings: {
    priceDropReminderEnabled: {
      type: Boolean,
      default: true
    }
  },
  // Codex, GPT-5.5 High, OpenAI.
  deletedAt: {
    type: Date
  },
  // end: Codex, GPT-5.5 High, OpenAI.
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.statics.hashPassword = function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHash('sha256').update(salt + password).digest('hex');
  return salt + ':' + hash;
};

userSchema.methods.verifyPassword = function verifyPassword(password) {
  const parts = (this.passwordHash || '').split(':');
  if (parts.length === 2) {
    const [salt, hash] = parts;
    return hash === crypto.createHash('sha256').update(salt + password).digest('hex');
  }
  // backward compatible: unsalted legacy hash
  return this.passwordHash === crypto.createHash('sha256').update(password).digest('hex');
};

module.exports = mongoose.model('User', userSchema);
// end: Codex, GPT-5.5 High, OpenAI.
