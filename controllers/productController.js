// Codex, GPT-5.5 High, OpenAI.
const Product = require('../models/Product');
const Favorite = require('../models/Favorite');
const { buildFilter, buildSort } = require('../utils/productSearch');
const { readBrowseIds, appendProductToBrowse } = require('../utils/browseHistory');
const { getRecommendationsForDetail } = require('../services/productRecommendations');
const {
  ALLOWED_CATEGORIES,
  parseTags,
  uniqueTags,
  recommendByName,
  buildOptimizeTags,
  validateProductPayload
} = require('../utils/publishAssist');
const { findHighSimilarProducts } = require('../services/duplicateProductDetector');
const { readRuntimeConfig } = require('../utils/runtimeConfigStore');
const { notifyPriceDrop } = require('../services/priceDropNotifier');
const {
  getSellerReputationFromProduct,
  getCurrentSellerDashboard
} = require('../services/sellerReputation');

function normalizeWearGrade(body) {
  if (body.condition !== 'used') return undefined;
  const g = body.wearGrade;
  return ['like_new', 'good', 'fair', 'visible_wear'].includes(g) ? g : 'good';
}

function normalizeFreeShipping(body) {
  return body.freeShipping === '1' || body.freeShipping === 'on' || body.freeShipping === true;
}

function buildPublishPayload(req) {
  const condition = req.body.condition === 'used' ? 'used' : 'new';
  const wearGrade = String(req.body.wearGrade || '').trim();
  return {
    name: String(req.body.name || '').trim(),
    description: String(req.body.description || '').trim(),
    price: Number(req.body.price),
    category: String(req.body.category || '').trim(),
    condition,
    wearGrade,
    freeShipping: normalizeFreeShipping(req.body),
    imageUrl: req.body.imageUrl || '/images/product-default.svg',
    sellerName: req.currentUser ? req.currentUser.username : req.body.sellerName,
    owner: req.currentUser ? req.currentUser._id : undefined,
    stock: Number(req.body.stock || 1),
    tags: parseTags(req.body.tags)
  };
}

function composeFinalTags(payload) {
  const autoTags = buildOptimizeTags(payload);
  return uniqueTags([...payload.tags, ...autoTags]);
}

function getSuggestion(payload) {
  return recommendByName(payload.name);
}

function withFormDefaults(base) {
  return {
    ...base,
    allowedCategories: ALLOWED_CATEGORIES
  };
}

function hasForcePublish(body) {
  return body.forcePublish === '1' || body.forcePublish === 'on' || body.forcePublish === true;
}

async function runDuplicateDetection(payload, options = {}) {
  const config = await readRuntimeConfig();
  const threshold = Number(config.duplicateSimilarityThreshold || 0.78);
  const matches = await findHighSimilarProducts(payload, {
    threshold,
    excludeProductId: options.excludeProductId
  });
  return {
    threshold,
    matches
  };
}

function buildPriceInsights(product) {
  const rawHistory = Array.isArray(product.priceHistory) ? product.priceHistory : [];
  const history = rawHistory
    .filter((item) => item && Number.isFinite(Number(item.price)))
    .map((item) => ({
      price: Number(item.price),
      changedAt: item.changedAt ? new Date(item.changedAt) : new Date(product.createdAt || Date.now())
    }))
    .sort((a, b) => a.changedAt - b.changedAt);

  if (history.length === 0 && Number.isFinite(Number(product.price))) {
    history.push({
      price: Number(product.price),
      changedAt: new Date(product.createdAt || Date.now())
    });
  }

  const prices = history.map((item) => item.price);
  const currentPrice = Number(product.price);
  const low = prices.length ? Math.min(...prices) : currentPrice;
  const high = prices.length ? Math.max(...prices) : currentPrice;

  return {
    series: history.map((item) => ({
      price: item.price,
      changedAt: item.changedAt.toISOString()
    })),
    currentPrice,
    lowPrice: Number.isFinite(low) ? low : currentPrice,
    highPrice: Number.isFinite(high) ? high : currentPrice
  };
}

exports.home = async (req, res) => {
  const filter = buildFilter(req.query, { forceUsed: false });
  const sort = buildSort(req.query.sort);
  const products = await Product.find(filter).sort(sort);
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
  const filter = buildFilter(req.query, { forceUsed: true });
  const sort = buildSort(req.query.sort);
  const products = await Product.find(filter).sort(sort);
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

  const browseBefore = readBrowseIds(req);
  const [recommendations, sellerReputation, favoriteDoc] = await Promise.all([
    getRecommendationsForDetail(req, product),
    getSellerReputationFromProduct(product, 3),
    req.currentUser
      ? Favorite.findOne({ user: req.currentUser._id, product: product._id }).lean()
      : Promise.resolve(null)
  ]);
  const priceInsights = buildPriceInsights(product);
  appendProductToBrowse(res, product._id, browseBefore);

  res.render('products/detail', {
    title: product.name,
    active: '',
    product,
    recommendations,
    sellerReputation,
    favoriteState: {
      isFavorited: !!favoriteDoc,
      favoriteId: favoriteDoc ? favoriteDoc._id.toString() : '',
      alertEnabled: favoriteDoc ? !!favoriteDoc.alertEnabled : false
    },
    priceHistorySeries: priceInsights.series,
    priceStats: {
      current: priceInsights.currentPrice,
      low: priceInsights.lowPrice,
      high: priceInsights.highPrice
    }
  });
};

exports.newForm = (req, res) => {
  res.render('products/form', withFormDefaults({
    title: '发布商品',
    active: 'sell',
    product: {},
    action: '/products',
    method: 'POST',
    buttonText: '发布商品',
    formError: '',
    suggest: null,
    duplicateCheck: null
  }));
};

exports.mine = async (req, res) => {
  const [products, sellerDashboard] = await Promise.all([
    Product.find({ owner: req.currentUser._id }).sort({ createdAt: -1 }),
    getCurrentSellerDashboard(req.currentUser._id)
  ]);

  res.render('products/mine', {
    title: '我的发布',
    active: 'mine',
    products,
    sellerDashboard
  });
};

exports.create = async (req, res) => {
  const payload = buildPublishPayload(req);
  const errors = validateProductPayload(payload);
  const duplicateCheck = await runDuplicateDetection(payload);
  if (errors.length > 0) {
    return res.render('products/form', withFormDefaults({
      title: '发布商品',
      active: 'sell',
      product: payload,
      action: '/products',
      method: 'POST',
      buttonText: '发布商品',
      formError: errors.join(' '),
      suggest: getSuggestion(payload),
      duplicateCheck
    }));
  }
  if (duplicateCheck.matches.length > 0 && !hasForcePublish(req.body)) {
    return res.render('products/form', withFormDefaults({
      title: '发布商品',
      active: 'sell',
      product: payload,
      action: '/products',
      method: 'POST',
      buttonText: '发布商品',
      formError: '平台已有相似商品，避免重复发布。如确认无误，请勾选“仍要发布”。',
      suggest: getSuggestion(payload),
      duplicateCheck
    }));
  }
  const product = new Product({
    ...payload,
    ...(payload.condition === 'used' ? { wearGrade: normalizeWearGrade(payload) } : { wearGrade: undefined }),
    tags: composeFinalTags(payload)
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

  res.render('products/form', withFormDefaults({
    title: '编辑商品',
    active: '',
    product,
    action: '/products/' + product._id + '?_method=PUT',
    method: 'POST',
    buttonText: '保存修改',
    formError: '',
    suggest: null,
    duplicateCheck: null
  }));
};

exports.update = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.redirect('/');
  if (!product.owner || product.owner.toString() !== req.currentUser._id.toString()) {
    return res.redirect('/products/mine');
  }

  const payload = buildPublishPayload(req);
  const errors = validateProductPayload(payload);
  const duplicateCheck = await runDuplicateDetection(payload, { excludeProductId: product._id });
  const oldPrice = Number(product.price);
  if (errors.length > 0) {
    return res.render('products/form', withFormDefaults({
      title: '编辑商品',
      active: '',
      product: { ...payload, _id: product._id },
      action: '/products/' + product._id + '?_method=PUT',
      method: 'POST',
      buttonText: '保存修改',
      formError: errors.join(' '),
      suggest: getSuggestion(payload),
      duplicateCheck
    }));
  }
  if (duplicateCheck.matches.length > 0 && !hasForcePublish(req.body)) {
    return res.render('products/form', withFormDefaults({
      title: '编辑商品',
      active: '',
      product: { ...payload, _id: product._id },
      action: '/products/' + product._id + '?_method=PUT',
      method: 'POST',
      buttonText: '保存修改',
      formError: '平台已有相似商品，避免重复发布。如确认无误，请勾选“仍要发布”。',
      suggest: getSuggestion(payload),
      duplicateCheck
    }));
  }

  product.name = payload.name;
  product.description = payload.description;
  product.price = payload.price;
  product.category = payload.category;
  product.condition = payload.condition;
  if (payload.condition === 'used') {
    product.wearGrade = normalizeWearGrade(payload);
  } else {
    product.set('wearGrade', undefined);
  }
  product.freeShipping = payload.freeShipping;
  product.imageUrl = payload.imageUrl;
  product.sellerName = payload.sellerName;
  product.stock = payload.stock;
  product.tags = composeFinalTags(payload);
  await product.save();
  await notifyPriceDrop(product, oldPrice, payload.price);

  res.redirect('/products/' + product._id);
};

exports.remove = async (req, res) => {
  await Product.deleteMany({
    _id: req.params.id,
    owner: req.currentUser._id
  });
  res.redirect('/products/mine');
};
// end: Codex, GPT-5.5 High, OpenAI.
