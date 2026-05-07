const Favorite = require('../models/Favorite');
const Notification = require('../models/Notification');
const User = require('../models/User');

async function notifyPriceDrop(product, oldPrice, newPrice) {
  if (!product || !product._id) return;
  if (!(Number(newPrice) < Number(oldPrice))) return;

  const favorites = await Favorite.find({
    product: product._id,
    alertEnabled: true,
    watchedPrice: { $gt: Number(newPrice) }
  }).lean();
  if (favorites.length === 0) return;

  const userIds = [...new Set(favorites.map((item) => item.user.toString()))];
  const users = await User.find({ _id: { $in: userIds } })
    .select('settings.priceDropReminderEnabled')
    .lean();
  const allowSet = new Set(
    users
      .filter((u) => !(u.settings && u.settings.priceDropReminderEnabled === false))
      .map((u) => u._id.toString())
  );

  const docs = favorites
    .filter((f) => allowSet.has(f.user.toString()))
    .map((f) => ({
      user: f.user,
      type: 'price_drop',
      title: '收藏商品降价提醒',
      content:
        `你收藏的「${product.name}」已从 ¥${Number(oldPrice).toFixed(2)} 降至 ¥${Number(newPrice).toFixed(2)}。` +
        `（收藏时价格 ¥${Number(f.watchedPrice).toFixed(2)}）`,
      link: `/products/${product._id}`
    }));

  if (docs.length > 0) {
    await Notification.insertMany(docs);
  }
}

module.exports = {
  notifyPriceDrop
};
