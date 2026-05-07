const crypto = require('crypto');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { readCart } = require('../controllers/cartController');
const { readBrowseIds } = require('../utils/browseHistory');
const { getJson, setJson, DEFAULT_TTL_SEC } = require('../utils/recommendCache');

const PRICE_BAND_LOW = 0.65;
const PRICE_BAND_HIGH = 1.4;
const RESULT_LIMIT = 8;
const CACHE_PREFIX = 'cream:reco:v1';

function toObjectIds(ids) {
  return ids
    .map((id) => {
      try {
        return new mongoose.Types.ObjectId(id);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

async function gatherContext(req, currentProductId, browseIdsBefore) {
  const cur = currentProductId.toString();
  const browseIds = browseIdsBefore.filter((id) => id !== cur);

  const cart = readCart(req);
  const cartIds = cart.map((item) => item.productId).filter((id) => id && id !== cur);

  let purchaseIds = [];
  if (req.currentUser) {
    const orders = await Order.find({ owner: req.currentUser._id }).select('items.product').lean();
    purchaseIds = [
      ...new Set(
        orders.flatMap((o) =>
          (o.items || []).map((i) => (i.product ? i.product.toString() : null)).filter(Boolean)
        )
      )
    ].filter((id) => id !== cur);
  }

  const metaIds = [...new Set([...browseIds, ...cartIds, ...purchaseIds])].slice(0, 80);

  const sellerIdsFromBrowse = new Set();
  const interestCategories = new Set();

  if (metaIds.length > 0) {
    const metas = await Product.find({ _id: { $in: toObjectIds(metaIds) } })
      .select('category owner')
      .lean();

    const browseSet = new Set(browseIds);
    metas.forEach((p) => {
      const id = p._id.toString();
      if (p.category) interestCategories.add(p.category);
      if (browseSet.has(id) && p.owner) sellerIdsFromBrowse.add(p.owner.toString());
    });
  }

  return {
    browseIds,
    cartIds,
    purchaseIds,
    sellerIdsFromBrowse,
    interestCategories
  };
}

function cacheFingerprint(currentId, ctx, userKey) {
  const payload = {
    u: userKey,
    pid: currentId.toString(),
    b: ctx.browseIds.slice(0, 20),
    c: [...ctx.cartIds].sort(),
    p: [...ctx.purchaseIds].slice(0, 30).sort()
  };
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 32);
}

function sortSignals(p, current, ctx, priceLow, priceHigh) {
  const ownerStr = p.owner && p.owner.toString();
  return {
    sameCategory: p.category === current.category ? 1 : 0,
    samePriceBand: p.price >= priceLow && p.price <= priceHigh ? 1 : 0,
    sameSellerFromBrowse: ownerStr && ctx.sellerIdsFromBrowse.has(ownerStr) ? 1 : 0,
    sameInterestCategory: ctx.interestCategories.has(p.category) ? 1 : 0
  };
}

async function collectCandidates(baseFilter, ctx, current) {
  const priceLow = current.price * PRICE_BAND_LOW;
  const priceHigh = current.price * PRICE_BAND_HIGH;
  const seen = new Set();
  const out = [];

  async function take(extra, limit, sort) {
    const q = Product.find({ ...baseFilter, ...extra });
    if (sort) q.sort(sort);
    const rows = await q.limit(limit).lean();
    for (const row of rows) {
      const id = row._id.toString();
      if (seen.has(id)) continue;
      seen.add(id);
      out.push(row);
    }
  }

  await take(
    {
      category: current.category,
      price: { $gte: priceLow, $lte: priceHigh }
    },
    32,
    { createdAt: -1 }
  );

  await take({ category: current.category }, 28, { createdAt: -1 });

  const sellerList = [...ctx.sellerIdsFromBrowse];
  if (sellerList.length > 0) {
    const oids = toObjectIds(sellerList);
    if (oids.length > 0) {
      await take({ owner: { $in: oids } }, 28, { createdAt: -1 });
    }
  }

  const cats = [...ctx.interestCategories].filter((c) => c && c !== current.category);
  if (cats.length > 0) {
    await take({ category: { $in: cats } }, 24, { createdAt: -1 });
  }

  await take({}, 24, { createdAt: -1 });

  return { candidates: out, priceLow, priceHigh };
}

function rankAndSlice(candidates, current, ctx, priceLow, priceHigh) {
  const scored = candidates.map((p) => ({
    doc: p,
    signals: sortSignals(p, current, ctx, priceLow, priceHigh)
  }));
  scored.sort((a, b) => {
    if (b.signals.sameCategory !== a.signals.sameCategory) {
      return b.signals.sameCategory - a.signals.sameCategory;
    }
    if (b.signals.samePriceBand !== a.signals.samePriceBand) {
      return b.signals.samePriceBand - a.signals.samePriceBand;
    }
    if (b.signals.sameSellerFromBrowse !== a.signals.sameSellerFromBrowse) {
      return b.signals.sameSellerFromBrowse - a.signals.sameSellerFromBrowse;
    }
    if (b.signals.sameInterestCategory !== a.signals.sameInterestCategory) {
      return b.signals.sameInterestCategory - a.signals.sameInterestCategory;
    }
    return new Date(b.doc.createdAt) - new Date(a.doc.createdAt);
  });
  return scored.slice(0, RESULT_LIMIT).map((s) => s.doc);
}

async function hydrateByIds(ids) {
  if (!ids || ids.length === 0) return [];
  const oids = toObjectIds(ids);
  const rows = await Product.find({
    _id: { $in: oids },
    stock: { $gt: 0 }
  }).lean();
  const map = new Map(rows.map((r) => [r._id.toString(), r]));
  return ids.map((id) => map.get(id)).filter(Boolean);
}

async function computeRecommendations(current, ctx) {
  const baseFilter = {
    _id: { $ne: current._id },
    stock: { $gt: 0 }
  };
  const { candidates, priceLow, priceHigh } = await collectCandidates(baseFilter, ctx, current);
  return rankAndSlice(candidates, current, ctx, priceLow, priceHigh);
}

/**
 * Returns plain product objects for EJS (lean documents).
 */
async function getRecommendationsForDetail(req, currentProduct) {
  const userKey = req.currentUser ? req.currentUser._id.toString() : 'guest';
  const browseBefore = readBrowseIds(req);
  const ctx = await gatherContext(req, currentProduct._id, browseBefore);

  const fp = cacheFingerprint(currentProduct._id, ctx, userKey);
  const cacheKey = `${CACHE_PREFIX}:${currentProduct._id}:${fp}`;

  const cachedIds = await getJson(cacheKey);
  if (Array.isArray(cachedIds) && cachedIds.length >= 4) {
    const hydrated = await hydrateByIds(cachedIds);
    if (hydrated.length >= 4) return hydrated;
  }

  const fresh = await computeRecommendations(currentProduct, ctx);
  const ids = fresh.map((p) => p._id.toString());
  await setJson(cacheKey, ids, DEFAULT_TTL_SEC);
  return fresh;
}

module.exports = {
  getRecommendationsForDetail,
  gatherContext,
  computeRecommendations
};
