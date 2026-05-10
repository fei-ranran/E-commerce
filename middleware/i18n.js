const fs = require('fs');
const path = require('path');

let dict = { zh: {}, en: {} };
try {
  const src = fs.readFileSync(path.join(__dirname, '..', 'config', 'i18n.json'), 'utf8');
  dict = JSON.parse(src);
} catch (e) {
  console.warn('i18n: failed to load dictionary', e.message);
}

function parseCookie(cookieHeader) {
  const out = {};
  if (!cookieHeader) return out;
  cookieHeader.split(';').forEach(part => {
    const idx = part.indexOf('=');
    if (idx < 0) return;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    out[k] = decodeURIComponent(v);
  });
  return out;
}

module.exports = function i18nMiddleware(req, res, next) {
  // determine language: cookie cream_lang -> 'en' or 'zh'
  const cookies = parseCookie(req.headers.cookie || '');
  let lang = (cookies.cream_lang === 'en') ? 'en' : 'zh';
  // expose current lang
  res.locals.lang = lang;

  // translation function available in templates: __('key')
  res.locals.__ = function (key, fallback) {
    if (!key) return '';
    const cur = dict[lang] || {};
    if (cur[key]) return cur[key];
    // fallback to zh then provided fallback
    if ((dict.zh || {})[key]) return dict.zh[key];
    return fallback || key;
  };

  next();
};
