const Product = require('../models/Product');

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-z0-9]+/g, ' ')
    .trim();
}

function toTokenSet(text) {
  const clean = normalizeText(text);
  if (!clean) return new Set();
  return new Set(clean.split(/\s+/).filter(Boolean));
}

function jaccard(setA, setB) {
  if (setA.size === 0 || setB.size === 0) return 0;
  let inter = 0;
  for (const item of setA) {
    if (setB.has(item)) inter++;
  }
  const union = setA.size + setB.size - inter;
  return union > 0 ? inter / union : 0;
}

function priceSimilarity(a, b) {
  const x = Number(a || 0);
  const y = Number(b || 0);
  if (x <= 0 || y <= 0) return 0;
  const ratio = Math.abs(x - y) / Math.max(x, y);
  return Math.max(0, 1 - Math.min(1, ratio));
}

function calcSimilarity(input, candidate) {
  const nameA = toTokenSet(input.name);
  const nameB = toTokenSet(candidate.name);
  const descA = toTokenSet(input.description);
  const descB = toTokenSet(candidate.description);

  const nameSim = jaccard(nameA, nameB);
  const descSim = jaccard(descA, descB);
  const categorySim = input.category === candidate.category ? 1 : 0;
  const pSim = priceSimilarity(input.price, candidate.price);

  const score = nameSim * 0.42 + descSim * 0.2 + categorySim * 0.18 + pSim * 0.2;
  return {
    score,
    breakdown: {
      nameSim,
      descSim,
      categorySim,
      priceSim: pSim
    }
  };
}

async function findHighSimilarProducts(payload, options = {}) {
  const threshold = Number(options.threshold || 0.78);
  const excludeProductId = options.excludeProductId ? String(options.excludeProductId) : '';
  const price = Number(payload.price || 0);
  const nameTokens = [...toTokenSet(payload.name)].filter((t) => t.length >= 2).slice(0, 3);

  const filter = {
    stock: { $gt: 0 }
  };
  if (payload.category) filter.category = payload.category;
  if (price > 0) {
    filter.price = {
      $gte: price * 0.45,
      $lte: price * 2.2
    };
  }
  if (excludeProductId) {
    filter._id = { $ne: excludeProductId };
  }
  if (nameTokens.length > 0) {
    filter.$or = nameTokens.map((token) => ({ name: new RegExp(escapeRegExp(token), 'i') }));
  }

  const candidates = await Product.find(filter)
    .select('_id name price category description')
    .sort({ createdAt: -1 })
    .limit(80)
    .lean();

  const scored = candidates
    .map((candidate) => ({
      product: candidate,
      ...calcSimilarity(payload, candidate)
    }))
    .filter((item) => item.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return scored;
}

module.exports = {
  findHighSimilarProducts
};
