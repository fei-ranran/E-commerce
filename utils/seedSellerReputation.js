const crypto = require('crypto');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');

const BUYER_SEEDS = [
  { username: '买家小林', email: 'buyer.lin@cream.local' },
  { username: '买家阿周', email: 'buyer.zhou@cream.local' },
  { username: '买家小陈', email: 'buyer.chen@cream.local' },
  { username: '买家晓雯', email: 'buyer.wen@cream.local' },
  { username: '买家阿凯', email: 'buyer.kai@cream.local' }
];

const REVIEW_TEMPLATES = [
  '发货很快，商品和描述一致，整体体验不错。',
  '沟通顺畅，包装仔细，值得推荐。',
  '性价比很高，使用体验很好，下次还会回购。',
  '卖家回复及时，交易流程顺利。',
  '实物状态比预期好，购物体验满意。'
];

function hashShort(input) {
  return crypto.createHash('md5').update(String(input)).digest('hex').slice(0, 8);
}

function buildSellerIdentity(name) {
  const id = hashShort(name);
  return {
    username: `seller_${id}`,
    email: `seller.${id}@cream.local`
  };
}

async function ensureUser({ username, email }) {
  let user = await User.findOne({ email });
  if (user) return user;
  user = await User.findOne({ username });
  if (user) return user;
  return User.create({
    username,
    email,
    passwordHash: User.hashPassword('Cream1234'),
    role: 'customer'
  });
}

function pickRating(seed) {
  const v = seed % 100;
  if (v < 70) return 5;
  if (v < 92) return 4;
  return 3;
}

async function seedSellerReputation() {
  const allProducts = await Product.find({}).select('_id name sellerName owner price condition').lean();
  if (allProducts.length === 0) return;

  const sellerNameSet = [...new Set(allProducts.map((p) => p.sellerName || 'Cream Market'))];
  const sellerUserMap = new Map();
  for (const sellerName of sellerNameSet) {
    const identity = buildSellerIdentity(sellerName);
    const sellerUser = await ensureUser(identity);
    sellerUserMap.set(sellerName, sellerUser);
  }

  // 兼容历史数据：无 owner 的商品按 sellerName 绑定卖家账号。
  for (const product of allProducts) {
    if (product.owner) continue;
    const seller = sellerUserMap.get(product.sellerName || 'Cream Market');
    if (!seller) continue;
    await Product.updateOne({ _id: product._id }, { $set: { owner: seller._id } });
  }

  const buyers = [];
  for (const buyerSeed of BUYER_SEEDS) {
    buyers.push(await ensureUser(buyerSeed));
  }

  const productsBySeller = new Map();
  const refreshedProducts = await Product.find({}).select('_id name sellerName owner price condition').lean();
  refreshedProducts.forEach((product) => {
    if (!product.owner) return;
    const key = product.owner.toString();
    if (!productsBySeller.has(key)) productsBySeller.set(key, []);
    productsBySeller.get(key).push(product);
  });

  for (const [sellerId, sellerProducts] of productsBySeller.entries()) {
    if (!sellerProducts || sellerProducts.length === 0) continue;
    const sellerName = sellerProducts[0].sellerName || '卖家';
    const existingReviewCount = await Review.countDocuments({ seller: sellerId });
    const need = Math.max(0, 3 - existingReviewCount);
    if (need <= 0) continue;

    for (let i = 0; i < need; i++) {
      const buyer = buyers[(existingReviewCount + i) % buyers.length];
      const product = sellerProducts[(existingReviewCount + i) % sellerProducts.length];
      const seedBase = parseInt(hashShort(`${sellerId}:${buyer._id}:${product._id}`), 16);
      const rating = pickRating(seedBase);
      const content = REVIEW_TEMPLATES[(seedBase + i) % REVIEW_TEMPLATES.length];
      const now = new Date();

      const order = await Order.create({
        owner: buyer._id,
        customerName: buyer.username,
        phone: '13800000000',
        address: '系统初始化地址',
        items: [
          {
            product: product._id,
            seller: sellerId,
            sellerName,
            name: product.name,
            price: Number(product.price || 0),
            quantity: 1,
            condition: product.condition || 'new'
          }
        ],
        total: Number(product.price || 0),
        status: '已完成',
        receivedAt: now,
        reviewDeadline: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        reviewClosedAt: now
      });

      await Review.create({
        order: order._id,
        buyer: buyer._id,
        seller: sellerId,
        rating,
        content,
        buyerNameSnapshot: buyer.username,
        sellerNameSnapshot: sellerName,
        createdAt: now
      });
    }
  }
}

module.exports = seedSellerReputation;
