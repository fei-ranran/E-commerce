// Codex, GPT-5.5 High, OpenAI.
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Antigravity, Claude Sonnet 4.6 (thinking), Anthropic. 
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }, // end: Antigravity, Claude Sonnet 4.6 (thinking), Anthropic. 
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      name: String,
      price: Number,
      quantity: Number,
      condition: String
    }
  ],
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    default: '待处理'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
//end: Codex, GPT-5.5 High, OpenAI.
