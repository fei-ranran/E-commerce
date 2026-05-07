const Order = require('../models/Order');
const Product = require('../models/Product');

async function migrateOrderDocuments() {
  const orders = await Order.find({
    'items.product': { $exists: true },
    $or: [{ 'items.seller': { $exists: false } }, { 'items.sellerName': { $exists: false } }]
  }).lean();

  if (orders.length === 0) return;

  for (const order of orders) {
    const ids = (order.items || [])
      .map((item) => (item.product ? item.product.toString() : null))
      .filter(Boolean);
    if (ids.length === 0) continue;

    const products = await Product.find({ _id: { $in: ids } }).select('_id owner sellerName').lean();
    const productMap = new Map(products.map((item) => [item._id.toString(), item]));

    const nextItems = (order.items || []).map((item) => {
      const hit = item.product ? productMap.get(item.product.toString()) : null;
      return {
        ...item,
        seller: item.seller || (hit && hit.owner ? hit.owner : undefined),
        sellerName: item.sellerName || (hit && hit.sellerName ? hit.sellerName : undefined)
      };
    });

    await Order.updateOne({ _id: order._id }, { $set: { items: nextItems } });
  }
}

module.exports = migrateOrderDocuments;
