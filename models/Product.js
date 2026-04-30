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
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);
//end: Codex, GPT-5.5 High, OpenAI.
