const mongoose = require('mongoose');
const seedSellerReputation = require('../utils/seedSellerReputation');
const Review = require('../models/Review');

async function run() {
  const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/cream-market';
  await mongoose.connect(mongoUrl);
  await seedSellerReputation();
  const totalReviews = await Review.countDocuments();
  console.log('reviews_total', totalReviews);
  await mongoose.disconnect();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
