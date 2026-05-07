const MAX_IDS = 40;
const COOKIE_NAME = 'cream_browse';
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

function readBrowseIds(req) {
  try {
    const raw = JSON.parse(req.cookies[COOKIE_NAME] || '[]');
    if (!Array.isArray(raw)) return [];
    return raw.map(String).filter(Boolean).slice(0, MAX_IDS);
  } catch {
    return [];
  }
}

function appendProductToBrowse(res, productId, previousList) {
  const id = productId.toString();
  const next = [id, ...previousList.filter((x) => x !== id)].slice(0, MAX_IDS);
  res.cookie(COOKIE_NAME, JSON.stringify(next), {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: MAX_AGE_MS
  });
  return next;
}

module.exports = {
  readBrowseIds,
  appendProductToBrowse,
  COOKIE_NAME
};
