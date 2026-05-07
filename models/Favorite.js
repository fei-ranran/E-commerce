const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  watchedPrice: {
    type: Number,
    required: true,
    min: 0
  },
  alertEnabled: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

favoriteSchema.index({ user: 1, product: 1 }, { unique: true });
favoriteSchema.index({ user: 1, updatedAt: -1 });

favoriteSchema.pre('save', function syncUpdateTime(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Favorite', favoriteSchema);
