const mongoose = require('mongoose');

const MONGO_URL = 'mongodb://127.0.0.1:27017/cream-market';

async function test() {
  try {
    await mongoose.connect(MONGO_URL, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ MongoDB connection test passed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ MongoDB connection test failed:', err);
    process.exit(1);
  }
}

test();