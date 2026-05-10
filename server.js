// Codex, GPT-5.5 High, OpenAI.
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const path = require('path');

const session = require('express-session');
const i18n = require('./middleware/i18n');
const attachCurrentUser = require('./middleware/currentUser');
const redirectToLogin = require('./middleware/redirectToLogin');
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const favoriteRoutes = require('./routes/favorites');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/uploads');
const captchaRoutes = require('./routes/captcha');
const seedProducts = require('./utils/seed');
const migrateOrderDocuments = require('./utils/migrateOrderCompat');
const seedSellerReputation = require('./utils/seedSellerReputation');
const seedUsers = require('./utils/seedUsers');

const app = express();
const PORT = process.env.PORT || 12399;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/cream-market';

const mongoOptions = { serverSelectionTimeoutMS: 2500 };
if (process.env.MONGO_USER && process.env.MONGO_PASS) {
  mongoOptions.auth = { username: process.env.MONGO_USER, password: process.env.MONGO_PASS };
  mongoOptions.authSource = 'admin';
}

mongoose.set('bufferCommands', false);
mongoose
  .connect(MONGO_URL, mongoOptions)
  .then(async () => {
    console.log('MongoDB connected:', MONGO_URL);
    await seedProducts();
    await seedUsers();
    await migrateOrderDocuments();
    await seedSellerReputation();
  })
  .catch((error) => {
    console.log('MongoDB connection failed:', error.message);
  });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false, limit: '6mb' }));
app.use(methodOverride('_method'));
// session for captcha and small features
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'cream-secret-local',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 30 }
  })
);
// server-side i18n: set res.locals.__ for templates
app.use(i18n);
app.use(attachCurrentUser);
// redirect unauthenticated users to login for non-public pages
app.use(redirectToLogin);

app.use('/', indexRoutes);
app.use('/', authRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/favorites', favoriteRoutes);
app.use('/admin', adminRoutes);
app.use('/uploads', uploadRoutes);
app.use('/captcha', captchaRoutes);

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

app.listen(PORT, '0.0.0.0', () => {
  console.log('Cream Market is running at http://localhost:' + PORT);
});
// end: Codex, GPT-5.5 High, OpenAI.