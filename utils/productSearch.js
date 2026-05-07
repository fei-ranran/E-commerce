/**
 * 商品列表高级筛选：由 productController 首页 / 二手页调用。
 *
 * 查询参数（GET）
 * - keyword        关键词（名称、描述、分类、卖家模糊匹配）
 * - category       精确分类
 * - minPrice,maxPrice  价格区间（元），可只填一侧；颠倒的区间会自动对调
 * - quality        成色：all | new | used | used_like_new | used_good | used_fair | used_visible_wear
 * - postedWithin   上架时间：1 | 7 | 30 | 90（天），空为不限
 * - freeShipping   1 / true 表示仅包邮
 * - sort           newest | price_asc | price_desc | sales_desc | sales_asc | oldest
 * - includeSoldOut 任意真值则包含售罄（库存 0）
 *
 * forceUsed：二手路由为 true，强制 condition=used，quality 仅解析二手成色档。
 */
const WEAR_GRADES = ['like_new', 'good', 'fair', 'visible_wear'];

function parseNonNegativeNumber(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

// Codex, GPT-5.5 High, OpenAI.
function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
// end: Codex, GPT-5.5 High, OpenAI.

function applyQualityFilter(filter, query, { forceUsed = false } = {}) {
  const q = (query.quality || 'all').toString();

  if (forceUsed) {
    filter.condition = 'used';
    if (q === 'all' || q === 'used') return;
    const grade = q.startsWith('used_') ? q.replace(/^used_/, '') : q;
    if (WEAR_GRADES.includes(grade)) {
      filter.wearGrade = grade;
    }
    return;
  }

  if (q === 'all' || q === '') return;

  if (q === 'new') {
    filter.condition = 'new';
    return;
  }

  if (q === 'used') {
    filter.condition = 'used';
    return;
  }

  if (q.startsWith('used_')) {
    filter.condition = 'used';
    const grade = q.replace(/^used_/, '');
    if (WEAR_GRADES.includes(grade)) {
      filter.wearGrade = grade;
    }
  }
}

function buildFilter(query, options = {}) {
  const filter = {};
  const { forceUsed = false } = options;

  if (query.keyword) {
    const kw = query.keyword.toString().trim();
    if (kw) {
      // Codex, GPT-5.5 High, OpenAI.
      const safeKeyword = escapeRegExp(kw);
      filter.$or = [
        { name: new RegExp(safeKeyword, 'i') },
        { description: new RegExp(safeKeyword, 'i') },
        { category: new RegExp(safeKeyword, 'i') },
        { sellerName: new RegExp(safeKeyword, 'i') }
      ];
      // end: Codex, GPT-5.5 High, OpenAI.
    }
  }

  if (query.category) {
    filter.category = query.category.toString();
  }

  if (forceUsed) {
    applyQualityFilter(filter, query, { forceUsed: true });
  } else {
    applyQualityFilter(filter, query, { forceUsed: false });
  }

  let minPrice = parseNonNegativeNumber(query.minPrice);
  let maxPrice = parseNonNegativeNumber(query.maxPrice);
  if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
    const t = minPrice;
    minPrice = maxPrice;
    maxPrice = t;
  }
  if (minPrice != null || maxPrice != null) {
    filter.price = {};
    if (minPrice != null) filter.price.$gte = minPrice;
    if (maxPrice != null) filter.price.$lte = maxPrice;
  }

  const within = (query.postedWithin || '').toString();
  const dayMap = { '1': 1, '7': 7, '30': 30, '90': 90 };
  if (dayMap[within]) {
    const since = new Date();
    since.setDate(since.getDate() - dayMap[within]);
    filter.createdAt = { $gte: since };
  }

  if (query.freeShipping === '1' || query.freeShipping === 'true') {
    filter.freeShipping = true;
  }

  if (!query.includeSoldOut) {
    filter.stock = { $gt: 0 };
  }

  return filter;
}

function buildSort(sortParam) {
  const s = (sortParam || '').toString();
  switch (s) {
    case 'price_asc':
      return { price: 1, createdAt: -1 };
    case 'price_desc':
      return { price: -1, createdAt: -1 };
    case 'sales_desc':
      return { salesCount: -1, createdAt: -1 };
    case 'sales_asc':
      return { salesCount: 1, createdAt: -1 };
    case 'oldest':
      return { createdAt: 1 };
    case 'newest':
    default:
      return { createdAt: -1 };
  }
}

module.exports = {
  buildFilter,
  buildSort,
  WEAR_GRADES
};
