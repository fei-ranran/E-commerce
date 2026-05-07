const mongoose = require('mongoose');
const migrateProductDocuments = require('../utils/migrateProductCompat');
const Product = require('../models/Product');

async function run() {
  const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/cream-market';
  await mongoose.connect(mongoUrl);
  await migrateProductDocuments();
  const total = await Product.countDocuments();
  const singleHistory = await Product.countDocuments({ 'priceHistory.1': { $exists: false } });
  console.log('products', total, 'single_history', singleHistory);
  await mongoose.disconnect();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
