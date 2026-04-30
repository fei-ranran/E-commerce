// Codex, GPT-5.5 High, OpenAI.
const Product = require('../models/Product');

function buildFilter(query) {
  const filter = {};

  if (query.keyword) {
    filter.$or = [
      { name: new RegExp(query.keyword, 'i') },
      { description: new RegExp(query.keyword, 'i') },
      { category: new RegExp(query.keyword, 'i') },
      { sellerName: new RegExp(query.keyword, 'i') }
    ];
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.condition) {
    filter.condition = query.condition;
  }

  // Antigraity, Gemini 3.1 Pro (high), Google.
  if (!query.includeSoldOut) {
    filter.stock = { $gt: 0 };
  } // end: Antigraity, Gemini 3.1 Pro (high), Google.

  return filter;
}

exports.home = async (req, res) => {
  const filter = buildFilter({
    keyword: req.query.keyword,
    category: req.query.category
  });
  const products = await Product.find(filter).sort({ createdAt: -1 });
  const categories = await Product.distinct('category');

  res.render('home', {
    title: 'Cream Market',
    active: 'home',
    products,
    categories,
    query: req.query
  });
};

exports.secondHand = async (req, res) => {
  const filter = buildFilter({ ...req.query, condition: 'used' });
  const products = await Product.find(filter).sort({ createdAt: -1 });
  const categories = await Product.distinct('category', { condition: 'used' });

  res.render('second-hand', {
    title: '二手交易',
    active: 'second',
    products,
    categories,
    query: req.query
  });
};

exports.detail = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.redirect('/');

  res.render('products/detail', {
    title: product.name,
    active: '',
    product
  });
};

exports.newForm = (req, res) => {
  res.render('products/form', {
    title: '发布商品',
    active: 'sell',
    product: {},
    action: '/products',
    method: 'POST',
    buttonText: '发布商品'
  });
};

exports.mine = async (req, res) => {
  const products = await Product.find({ owner: req.currentUser._id }).sort({ createdAt: -1 });

  res.render('products/mine', {
    title: '我的发布',
    active: 'mine',
    products
  });
};

exports.create = async (req, res) => {
  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    price: Number(req.body.price),
    category: req.body.category,
    condition: req.body.condition,
    imageUrl: req.body.imageUrl || '/images/product-default.svg',
    sellerName: req.currentUser ? req.currentUser.username : req.body.sellerName,
    owner: req.currentUser ? req.currentUser._id : undefined,
    stock: Number(req.body.stock || 1),
    tags: (req.body.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean)
  });

  await product.save();
  res.redirect('/products/' + product._id);
};

exports.editForm = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.redirect('/');
  if (!product.owner || product.owner.toString() !== req.currentUser._id.toString()) {
    return res.redirect('/products/mine');
  }

  res.render('products/form', {
    title: '编辑商品',
    active: '',
    product,
    action: '/products/' + product._id + '?_method=PUT',
    method: 'POST',
    buttonText: '保存修改'
  });
};

exports.update = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.redirect('/');
  if (!product.owner || product.owner.toString() !== req.currentUser._id.toString()) {
    return res.redirect('/products/mine');
  }

  product.name = req.body.name;
  product.description = req.body.description;
  product.price = Number(req.body.price);
  product.category = req.body.category;
  product.condition = req.body.condition;
  product.imageUrl = req.body.imageUrl || '/images/product-default.svg';
  product.sellerName = req.currentUser ? req.currentUser.username : req.body.sellerName;
  product.stock = Number(req.body.stock || 1);
  product.tags = (req.body.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean);
  await product.save();

  res.redirect('/products/' + product._id);
};

exports.remove = async (req, res) => {
  await Product.deleteMany({
    _id: req.params.id,
    owner: req.currentUser._id
  });
  res.redirect('/products/mine');
};
//end: Codex, GPT-5.5 High, OpenAI.
