// Codex, GPT-5.5 High, OpenAI.
const Order = require('../models/Order');
const Product = require('../models/Product');
const Review = require('../models/Review');
const { getCartViewModel } = require('./cartController');
const { filterSensitiveWords } = require('../utils/reviewTextFilter');

const REVIEW_WINDOW_DAYS = 7;

function addDays(date, days) {
  return new Date(new Date(date).getTime() + days * 24 * 60 * 60 * 1000);
}

async function closeExpiredReviewWindows() {
  await Order.updateMany(
    {
      status: '已完成',
      reviewDeadline: { $lt: new Date() },
      reviewClosedAt: { $exists: false }
    },
    { $set: { reviewClosedAt: new Date() } }
  );
}

function canReviewOrder(order) {
  if (!order) return false;
  if (order.status !== '已完成') return false;
  if (!order.reviewDeadline) return false;
  if (order.reviewClosedAt) return false;
  return new Date(order.reviewDeadline).getTime() >= Date.now();
}

function getReviewSellerCandidates(order) {
  const map = new Map();
  (order.items || []).forEach((item) => {
    if (!item.seller) return;
    const key = item.seller.toString();
    if (map.has(key)) return;
    map.set(key, {
      sellerId: key,
      sellerName: item.sellerName || '卖家',
      items: []
    });
  });
  (order.items || []).forEach((item) => {
    if (!item.seller) return;
    const key = item.seller.toString();
    const hit = map.get(key);
    if (!hit) return;
    hit.items.push({
      name: item.name,
      quantity: item.quantity
    });
  });
  return [...map.values()];
}

async function attachOrderReviewMeta(order, buyerId) {
  const sellers = getReviewSellerCandidates(order);
  if (!buyerId || sellers.length === 0) {
    return {
      reviewOpen: false,
      reviewExpired: false,
      pendingSellers: [],
      reviewedSellerIds: []
    };
  }

  const reviewed = await Review.find({
    order: order._id,
    buyer: buyerId
  })
    .select('seller')
    .lean();
  const reviewedSellerIds = new Set(reviewed.map((item) => item.seller.toString()));
  const pendingSellers = sellers.filter((item) => !reviewedSellerIds.has(item.sellerId));
  const reviewOpen = canReviewOrder(order) && pendingSellers.length > 0;
  const reviewExpired = !canReviewOrder(order) && order.status === '已完成';

  return {
    reviewOpen,
    reviewExpired,
    pendingSellers,
    reviewedSellerIds: [...reviewedSellerIds]
  };
}

exports.checkoutForm = async (req, res) => {
  const cart = await getCartViewModel(req);

  res.render('orders/checkout', {
    title: '结算',
    active: 'cart',
    cart,
    message: ''
  });
};

exports.create = async (req, res) => {
  const cart = await getCartViewModel(req);

  if (cart.items.length === 0) {
    return res.render('orders/checkout', {
      title: '结算',
      active: 'cart',
      cart,
      message: '购物车为空，无法提交订单。'
    });
  }

  const productIds = cart.items.map((item) => item.product._id);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((item) => [item._id.toString(), item]));

  const insufficient = cart.items.find((item) => {
    const product = productMap.get(item.product._id.toString());
    return !product || product.stock < item.quantity;
  });

  if (insufficient) {
    const product = products.find((one) => one._id.toString() === insufficient.product._id.toString());
    const name = product ? product.name : '商品';
    const stock = product ? product.stock : 0;
    return res.render('orders/checkout', {
      title: '结算',
      active: 'cart',
      cart,
      message: '“' + name + '”库存不足（剩余 ' + stock + ' 件），请调整数量后重试。'
    });
  }

  // Codex, GPT-5.5 High, OpenAI.
  const orderItems = cart.items.map((item) => {
    const snapshot = productMap.get(item.product._id.toString());
    return {
      product: item.product._id,
      seller: snapshot && snapshot.owner ? snapshot.owner : undefined,
      sellerName: snapshot && snapshot.sellerName ? snapshot.sellerName : item.product.sellerName,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      condition: item.product.condition
    };
  });

  const deductedItems = [];
  for (const item of orderItems) {
    const result = await Product.updateOne(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity, salesCount: item.quantity } }
    );

    if (result.modifiedCount !== 1) {
      for (const deducted of deductedItems) {
        await Product.updateOne(
          { _id: deducted.product },
          { $inc: { stock: deducted.quantity, salesCount: -deducted.quantity } }
        );
      }

      return res.render('orders/checkout', {
        title: '结算',
        active: 'cart',
        cart,
        message: '部分商品库存刚刚发生变化，请返回购物车确认后重试。'
      });
    }

    deductedItems.push(item);
  }

  const order = new Order({
    owner: req.currentUser._id,
    customerName: req.body.customerName,
    phone: req.body.phone,
    address: req.body.address,
    items: orderItems,
    total: cart.total,
    status: '待收货'
  });

  try {
    await order.save();
  } catch (error) {
    for (const deducted of deductedItems) {
      await Product.updateOne(
        { _id: deducted.product },
        { $inc: { stock: deducted.quantity, salesCount: -deducted.quantity } }
      );
    }
    throw error;
  }
  // end: Codex, GPT-5.5 High, OpenAI.

  res.clearCookie('cream_cart');
  res.redirect('/orders/' + order._id);
};

exports.show = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.redirect('/');
  if (order.owner && (!req.currentUser || order.owner.toString() !== req.currentUser._id.toString())) {
    return res.redirect('/login');
  }

  if (
    order.owner &&
    !order.reviewClosedAt &&
    order.status === '已完成' &&
    order.reviewDeadline &&
    new Date(order.reviewDeadline) < new Date()
  ) {
    order.reviewClosedAt = new Date();
    await order.save();
  }

  let reviewMeta = {
    reviewOpen: false,
    reviewExpired: false,
    pendingSellers: [],
    reviewedSellerIds: []
  };
  let reviews = [];
  if (order.owner && req.currentUser) {
    reviewMeta = await attachOrderReviewMeta(order, req.currentUser._id);
    reviews = await Review.find({ order: order._id, buyer: req.currentUser._id })
      .sort({ createdAt: -1 })
      .lean();
  }

  res.render('orders/show', {
    title: '订单详情',
    active: '',
    order,
    reviewMeta,
    reviews
  });
};
// end: Codex, GPT-5.5 High, OpenAI.

// Antigravity, Claude Sonnet 4.6 (thinking), Anthropic. 
exports.myOrders = async (req, res) => {
  await closeExpiredReviewWindows();
  const orders = await Order.find({ owner: req.currentUser._id }).sort({ createdAt: -1 });
  const withMeta = await Promise.all(
    orders.map(async (order) => {
      const meta = await attachOrderReviewMeta(order, req.currentUser._id);
      return {
        ...order.toObject(),
        reviewMeta: meta
      };
    })
  );

  res.render('orders/mine', {
    title: '我的订单',
    active: 'orders',
    orders: withMeta
  });
}; // end: Antigravity, Claude Sonnet 4.6 (thinking), Anthropic. 

exports.confirmReceived = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.redirect('/orders/mine');
  if (!order.owner || order.owner.toString() !== req.currentUser._id.toString()) {
    return res.redirect('/orders/mine');
  }
  if (order.status === '已完成') return res.redirect('/orders/' + order._id);

  const now = new Date();
  order.status = '已完成';
  order.receivedAt = now;
  order.reviewDeadline = addDays(now, REVIEW_WINDOW_DAYS);
  order.reviewClosedAt = undefined;
  await order.save();
  res.redirect('/orders/' + order._id);
};

exports.submitReview = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.redirect('/orders/mine');
  if (!order.owner || order.owner.toString() !== req.currentUser._id.toString()) {
    return res.redirect('/orders/mine');
  }

  if (!canReviewOrder(order)) return res.redirect('/orders/' + order._id);

  const sellerId = String(req.body.sellerId || '');
  const rating = Number(req.body.rating || 0);
  const content = String(req.body.content || '').trim();
  if (!sellerId || !rating || !content) return res.redirect('/orders/' + order._id);
  if (rating < 1 || rating > 5) return res.redirect('/orders/' + order._id);

  const sellerHit = (order.items || []).find((item) => item.seller && item.seller.toString() === sellerId);
  if (!sellerHit) return res.redirect('/orders/' + order._id);

  const exists = await Review.findOne({
    order: order._id,
    buyer: req.currentUser._id,
    seller: sellerId
  })
    .select('_id')
    .lean();
  if (exists) return res.redirect('/orders/' + order._id);

  const filtered = filterSensitiveWords(content);
  await Review.create({
    order: order._id,
    buyer: req.currentUser._id,
    seller: sellerId,
    rating,
    content: filtered.cleanText,
    buyerNameSnapshot: req.currentUser.username || '',
    sellerNameSnapshot: sellerHit.sellerName || ''
  });

  const reviewMeta = await attachOrderReviewMeta(order, req.currentUser._id);
  if (reviewMeta.pendingSellers.length <= 1) {
    order.reviewClosedAt = new Date();
    await order.save();
  }

  res.redirect('/orders/' + order._id);
};
