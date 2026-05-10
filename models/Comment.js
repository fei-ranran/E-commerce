const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ['image', 'video'], required: true }
}, { _id: false });

const commentSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  content: { type: String, trim: true, maxlength: 600 },
  media: [mediaSchema],
  createdAt: { type: Date, default: Date.now }
});

commentSchema.index({ product: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
