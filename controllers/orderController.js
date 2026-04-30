// Codex, GPT-5.5 High, OpenAI.
const Order = require('../models/Order');
const Product = require('../models/Product');
const { getCartViewModel } = require('./cartController');

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

  const insufficient = cart.items.find((item) => {
    const product = products.find((one) => one._id.toString() === item.product._id.toString());
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

  const order = new Order({
    owner: req.currentUser ? req.currentUser._id : null, // Antigravity, Claude Sonnet 4.6 (thinking), Anthropic. 新增：将订单关联到登录用户
    customerName: req.body.customerName,
    phone: req.body.phone,
    address: req.body.address,
    items: cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      condition: item.product.condition
    })),
    total: cart.total
  });

  await order.save();

  for (const item of order.items) {
    await Product.updateOne(
      { _id: item.product },
      { $inc: { stock: -item.quantity } }
    );
  }

  res.clearCookie('cream_cart');
  res.redirect('/orders/' + order._id);
};

exports.show = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.redirect('/');

  res.render('orders/show', {
    title: '订单详情',
    active: '',
    order
  });
};
//end: Codex, GPT-5.5 High, OpenAI. 

// Antigravity, Claude Sonnet 4.6 (thinking), Anthropic. 
exports.myOrders = async (req, res) => {
  const orders = await Order.find({ owner: req.currentUser._id }).sort({ createdAt: -1 });

  res.render('orders/mine', {
    title: '我的订单',
    active: 'orders',
    orders
  });
}; // end: Antigravity, Claude Sonnet 4.6 (thinking), Anthropic. 
