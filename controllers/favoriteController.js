const Favorite = require('../models/Favorite');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Codex, GPT-5.5 High, OpenAI.
// Distinguish product-detail AJAX calls from favorites-page form submits.
// end: Codex, GPT-5.5 High, OpenAI.
const wantsJson = (req) => {
  const acceptHeader = req.get('accept') || '';
  return req.xhr || acceptHeader.includes('application/json') || req.accepts(['html', 'json']) === 'json';
};

exports.toggle = async (req, res) => {
  const product = await Product.findById(req.params.productId).select('_id owner price');
  if (!product) return res.status(404).json({ ok: false, message: '商品不存在' });

  const existing = await Favorite.findOne({
    user: req.currentUser._id,
    product: product._id
  });

  if (existing) {
    await Favorite.deleteOne({ _id: existing._id });
    return res.json({ ok: true, favorited: false, favoriteId: '' });
  }

  // Codex, GPT-5.5 High, OpenAI.
  // Treat a quick double-click duplicate-key race as already favorited instead of a 500 error.
  // end: Codex, GPT-5.5 High, OpenAI.
  let created;
  try {
    created = await Favorite.create({
      user: req.currentUser._id,
      product: product._id,
      watchedPrice: Number(product.price || 0),
      alertEnabled: true
    });
  } catch (error) {
    if (error && error.code === 11000) {
      created = await Favorite.findOne({
        user: req.currentUser._id,
        product: product._id
      });
    } else {
      throw error;
    }
  }
  if (!created) return res.status(409).json({ ok: false, message: 'favorite state changed' });
  return res.json({
    ok: true,
    favorited: true,
    favoriteId: created._id.toString(),
    alertEnabled: created.alertEnabled
  });
};

exports.toggleAlert = async (req, res) => {
  const favorite = await Favorite.findOne({
    _id: req.params.favoriteId,
    user: req.currentUser._id
  });
  // Codex, GPT-5.5 High, OpenAI.
  // The favorites page uses a normal POST form, so HTML requests should return to the page instead of showing raw JSON.
  // end: Codex, GPT-5.5 High, OpenAI.
  if (!favorite) {
    if (wantsJson(req)) return res.status(404).json({ ok: false });
    return res.redirect('/favorites');
  }
  favorite.alertEnabled = !favorite.alertEnabled;
  await favorite.save();
  if (wantsJson(req)) return res.json({ ok: true, alertEnabled: favorite.alertEnabled });
  return res.redirect('/favorites');
};

exports.remove = async (req, res) => {
  await Favorite.deleteOne({
    _id: req.params.favoriteId,
    user: req.currentUser._id
  });
  res.redirect('/favorites');
};

exports.toggleGlobalReminder = async (req, res) => {
  const user = await User.findById(req.currentUser._id);
  if (!user.settings) user.settings = {};
  // Codex, GPT-5.5 High, OpenAI.
  // Missing settings means "enabled" by default, so save the exact opposite of the current effective state.
  user.settings.priceDropReminderEnabled = user.settings.priceDropReminderEnabled === false;
  // end: Codex, GPT-5.5 High, OpenAI.
  await user.save();
  res.redirect('/favorites');
};

exports.list = async (req, res) => {
  const [favorites, reminders, user] = await Promise.all([
    Favorite.find({ user: req.currentUser._id })
      .populate('product', 'name price imageUrl category stock')
      .sort({ updatedAt: -1 })
      .lean(),
    Notification.find({ user: req.currentUser._id, type: 'price_drop' })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(),
    User.findById(req.currentUser._id).select('settings').lean()
  ]);

  // Codex, GPT-5.5 High, OpenAI.
  // Remove favorite records whose products no longer exist so counts and visible cards stay consistent.
  // end: Codex, GPT-5.5 High, OpenAI.
  const orphanFavoriteIds = favorites.filter((fav) => !fav.product).map((fav) => fav._id);
  if (orphanFavoriteIds.length) {
    await Favorite.deleteMany({
      _id: { $in: orphanFavoriteIds },
      user: req.currentUser._id
    });
  }
  const visibleFavorites = favorites.filter((fav) => fav.product);

  res.render('favorites/index', {
    title: '我的收藏',
    active: 'favorites',
    favorites: visibleFavorites,
    reminders,
    globalReminderEnabled: !(user && user.settings && user.settings.priceDropReminderEnabled === false)
  });
};
