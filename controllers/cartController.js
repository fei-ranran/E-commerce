// Codex, GPT-5.5 High, OpenAI.
const Product = require('../models/Product');

function readCart(req) {
  try {
    return JSON.parse(req.cookies.cream_cart || '[]');
  } catch (error) {
    return [];
  }
}

function writeCart(res, cart) {
  res.cookie('cream_cart', JSON.stringify(cart), {
    httpOnly: true,
    sameSite: 'lax'
  });
}

async function getCartViewModel(req) {
  const cart = readCart(req);
  const ids = cart.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: ids } });

  const items = cart
    .map((item) => {
      const product = products.find((one) => one._id.toString() === item.productId);
      if (!product) return null;
      return {
        product,
        quantity: item.quantity,
        subtotal: product.price * item.quantity
      };
    })
    .filter(Boolean);

  return {
    items,
    total: items.reduce((sum, item) => sum + item.subtotal, 0)
  };
}

exports.readCart = readCart;
exports.writeCart = writeCart;
exports.getCartViewModel = getCartViewModel;

exports.show = async (req, res) => {
  const cart = await getCartViewModel(req);

  res.render('cart/index', {
    title: '购物车',
    active: 'cart',
    cart
  });
};

exports.add = async (req, res) => {
  const product = await Product.findById(req.params.id);
  // Antigraity, Gemini 3.1 Pro (high), Google.：如果商品不存在或库存为0，禁止加入
  if (!product || product.stock <= 0) return res.redirect('/');
  // end: Antigraity, Gemini 3.1 Pro (high), Google.

  const cart = readCart(req);
  const current = cart.find((item) => item.productId === product._id.toString());
  const currentQuantity = current ? current.quantity : 0;

  // Antigraity, Gemini 3.1 Pro (high), Google.
  if (currentQuantity + 1 > product.stock) {
    res.cookie('flash_msg', '添加失败：已超过库存数量！');
    return res.redirect('back');
  } // end: Antigraity, Gemini 3.1 Pro (high), Google.

  if (current) {
    current.quantity += 1;
  } else {
    cart.push({ productId: product._id.toString(), quantity: 1 });
  }

  writeCart(res, cart);
  // Antigraity, Gemini 3.1 Pro (high), Google.
  if (!req.headers.referer || !req.headers.referer.includes('/cart')) {
    res.cookie('flash_msg', '成功加入购物车！');
  }
  res.redirect('back');
  // end: Antigraity, Gemini 3.1 Pro (high), Google.
};

exports.decrease = (req, res) => {
  const cart = readCart(req)
    .map((item) => {
      if (item.productId === req.params.id) {
        return { ...item, quantity: item.quantity - 1 };
      }
      return item;
    })
    .filter((item) => item.quantity > 0);

  writeCart(res, cart);
  res.redirect('/cart');
};

exports.remove = (req, res) => {
  const cart = readCart(req).filter((item) => item.productId !== req.params.id);
  writeCart(res, cart);
  res.redirect('/cart');
};

exports.clear = (req, res) => {
  res.clearCookie('cream_cart');
  res.redirect('/cart');
};
//end: Codex, GPT-5.5 High, OpenAI.