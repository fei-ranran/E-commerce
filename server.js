// Codex, GPT-5.5 High, OpenAI.
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const path = require('path');

const attachCurrentUser = require('./middleware/currentUser');
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const seedProducts = require('./utils/seed');

const app = express();
const PORT = process.env.PORT || 12399;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/cream-market';

mongoose.set('bufferCommands', false);
mongoose
  .connect(MONGO_URL, { serverSelectionTimeoutMS: 2500 })
  .then(async () => {
    console.log('MongoDB connected:', MONGO_URL);
    await seedProducts();
  })
  .catch((error) => {
    console.log('MongoDB connection failed:', error.message);
  });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false, limit: '6mb' }));
app.use(methodOverride('_method'));
app.use(attachCurrentUser);

app.use('/', indexRoutes);
app.use('/', authRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

app.use((error, req, res, next) => {
  console.log('Request failed:', error.message);
  res.status(500).render('error', {
    title: '系统暂不可用',
    active: '',
    message: error.message
  });
});

app.use((req, res) => {
  res.status(404).render('404', {
    title: '页面未找到',
    active: ''
  });
});

app.listen(PORT, () => {
  console.log('Cream Market is running at http://localhost:' + PORT);
});
// end: Codex, GPT-5.5 High, OpenAI.