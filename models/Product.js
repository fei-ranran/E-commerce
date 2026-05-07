// Codex, GPT-5.5 High, OpenAI.
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  priceHistory: [
    {
      price: {
        type: Number,
        required: true,
        min: 0
      },
      changedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  category: {
    type: String,
    required: true,
    trim: true
  },
  condition: {
    type: String,
    enum: ['new', 'used'],
    default: 'new'
  },
  imageUrl: {
    type: String,
    default: '/images/product-default.svg'
  },
  sellerName: {
    type: String,
    default: 'Cream Market'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  stock: {
    type: Number,
    default: 1,
    min: 0
  },
  salesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  freeShipping: {
    type: Boolean,
    default: false
  },
  wearGrade: {
    type: String,
    enum: ['like_new', 'good', 'fair', 'visible_wear'],
    required: false
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

productSchema.pre('save', function trackPriceHistory(next) {
  if (!Array.isArray(this.priceHistory)) this.priceHistory = [];

  const now = new Date();
  const latest = this.priceHistory[this.priceHistory.length - 1];
  const sameAsLatest = latest && Number(latest.price) === Number(this.price);

  if (this.isNew) {
    if (this.price != null && this.priceHistory.length === 0) {
      this.priceHistory.push({
        price: Number(this.price),
        changedAt: this.createdAt || now
      });
    }
    return next();
  }

  if (this.isModified('price') && this.price != null && !sameAsLatest) {
    this.priceHistory.push({
      price: Number(this.price),
      changedAt: now
    });
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
// end: Codex, GPT-5.5 High, OpenAI.
