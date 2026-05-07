const { WEAR_GRADES } = require('./productSearch');

const ALLOWED_CATEGORIES = [
  '数码设备',
  '数码配件',
  '云应用',
  '服务',
  '图书教材',
  '运动户外',
  '二手数码',
  '二手书籍',
  '二手家具',
  '二手家电',
  '二手乐器',
  '二手服饰',
  '二手配件',
  '二手家居'
];

const KEYWORD_HINTS = [
  { words: ['键盘', '鼠标', '显示器', '耳机', '路由器', 'nas'], category: '二手数码', min: 80, max: 1800 },
  { words: ['相机', '微单', '平板', '电脑', '主机'], category: '数码设备', min: 800, max: 9000 },
  { words: ['教材', '书', '学习', 'typescript', 'javascript'], category: '图书教材', min: 20, max: 150 },
  { words: ['简历', '咨询', '设计', '运维', '部署'], category: '服务', min: 100, max: 1200 },
  { words: ['椅', '桌', '沙发', '床'], category: '二手家具', min: 100, max: 1000 },
  { words: ['鞋', '外套', '衣', '球鞋'], category: '二手服饰', min: 60, max: 600 }
];

function parseTags(rawTags) {
  if (!rawTags) return [];
  if (Array.isArray(rawTags)) return rawTags.map((t) => String(t).trim()).filter(Boolean);
  return String(rawTags)
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

function uniqueTags(tags) {
  return [...new Set(tags.map((tag) => String(tag).trim()).filter(Boolean))];
}

function recommendByName(name) {
  const n = String(name || '').toLowerCase();
  for (const item of KEYWORD_HINTS) {
    if (item.words.some((word) => n.includes(String(word).toLowerCase()))) {
      return {
        category: item.category,
        minPrice: item.min,
        maxPrice: item.max
      };
    }
  }
  return null;
}

function buildOptimizeTags(payload) {
  const out = [];
  if (payload.freeShipping) out.push('包邮');
  if (payload.condition === 'used') {
    const wearMap = {
      like_new: '九成新',
      good: '成色良好',
      fair: '正常磨损',
      visible_wear: '明显使用痕迹'
    };
    if (wearMap[payload.wearGrade]) out.push(wearMap[payload.wearGrade]);
  } else {
    out.push('新品');
  }
  if (payload.price <= 99) out.push('低价好物');
  if (payload.price >= 2000) out.push('高价值');
  return uniqueTags(out);
}

function validateProductPayload(payload) {
  const errors = [];
  const p = Number(payload.price);
  if (!Number.isFinite(p) || p < 0) {
    errors.push('价格不能为负数，且必须是有效数字。');
  }

  if (!ALLOWED_CATEGORIES.includes(payload.category)) {
    errors.push('商品分类无效，请选择系统支持的分类。');
  }

  if (payload.condition === 'new' && payload.wearGrade) {
    errors.push('新品不应填写二手成色。');
  }

  if (payload.condition === 'used' && !WEAR_GRADES.includes(payload.wearGrade || '')) {
    errors.push('二手商品必须选择有效成色。');
  }

  return errors;
}

module.exports = {
  ALLOWED_CATEGORIES,
  parseTags,
  uniqueTags,
  recommendByName,
  buildOptimizeTags,
  validateProductPayload
};
