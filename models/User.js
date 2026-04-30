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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.statics.hashPassword = function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
};

userSchema.methods.verifyPassword = function verifyPassword(password) {
  return this.passwordHash === this.constructor.hashPassword(password);
};

module.exports = mongoose.model('User', userSchema);
// end: Codex, GPT-5.5 High, OpenAI.