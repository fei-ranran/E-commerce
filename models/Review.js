const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300
  },
  buyerNameSnapshot: {
    type: String,
    default: ''
  },
  sellerNameSnapshot: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

reviewSchema.index({ order: 1, buyer: 1, seller: 1 }, { unique: true });
reviewSchema.index({ seller: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
