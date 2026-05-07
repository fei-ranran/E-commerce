const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');

function round2(num) {
  return Math.round(Number(num || 0) * 100) / 100;
}

async function getSellerReputationByUserId(userId) {
  if (!userId) {
    return {
      averageRating: 0,
      goodRate: 0,
      successRate: 0,
      totalReviews: 0,
      successfulTrades: 0,
      totalTrades: 0
    };
  }

  const sellerId = new mongoose.Types.ObjectId(userId);

  const [reviewStatsRaw, tradeStatsRaw] = await Promise.all([
    Review.aggregate([
      { $match: { seller: sellerId } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          goodReviews: {
            $sum: {
              $cond: [{ $gte: ['$rating', 4] }, 1, 0]
            }
          }
        }
      }
    ]),
    Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.seller': sellerId } },
      {
        $group: {
          _id: null,
          totalTrades: { $sum: 1 },
          successfulTrades: {
            $sum: {
              $cond: [{ $eq: ['$status', '已完成'] }, 1, 0]
            }
          }
        }
      }
    ])
  ]);

  const reviewStats = reviewStatsRaw[0] || {};
  const tradeStats = tradeStatsRaw[0] || {};
  const totalReviews = Number(reviewStats.totalReviews || 0);
  const totalTrades = Number(tradeStats.totalTrades || 0);
  const goodReviews = Number(reviewStats.goodReviews || 0);
  const successfulTrades = Number(tradeStats.successfulTrades || 0);

  return {
    averageRating: round2(reviewStats.avgRating || 0),
    goodRate: totalReviews > 0 ? round2((goodReviews / totalReviews) * 100) : 0,
    successRate: totalTrades > 0 ? round2((successfulTrades / totalTrades) * 100) : 0,
    totalReviews,
    successfulTrades,
    totalTrades
  };
}

async function getRecentSellerReviews(userId, limit = 3) {
  if (!userId) return [];
  return Review.find({ seller: userId })
    .populate('buyer', 'username')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

async function getSellerReputationFromProduct(product, reviewLimit = 3) {
  if (product.owner) {
    const [stats, recentReviews] = await Promise.all([
      getSellerReputationByUserId(product.owner),
      getRecentSellerReviews(product.owner, reviewLimit)
    ]);
    return { stats, recentReviews };
  }

  // 无 owner 的历史商品无法精确关联卖家账号，返回默认统计。
  return {
    stats: {
      averageRating: 0,
      goodRate: 0,
      successRate: 0,
      totalReviews: 0,
      successfulTrades: 0,
      totalTrades: 0
    },
    recentReviews: []
  };
}

async function getCurrentSellerDashboard(userId) {
  const [stats, productsCount] = await Promise.all([
    getSellerReputationByUserId(userId),
    Product.countDocuments({ owner: userId })
  ]);
  return {
    ...stats,
    productsCount
  };
}

module.exports = {
  getSellerReputationByUserId,
  getRecentSellerReviews,
  getSellerReputationFromProduct,
  getCurrentSellerDashboard
};
