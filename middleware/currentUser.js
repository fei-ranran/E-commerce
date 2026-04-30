// Codex, GPT-5.5 High, OpenAI.
const User = require('../models/User');

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;

  cookieHeader.split(';').forEach((item) => {
    const parts = item.trim().split('=');
    const key = parts.shift();
    const value = parts.join('=');
    if (key) cookies[key] = decodeURIComponent(value || '');
  });

  return cookies;
}

async function attachCurrentUser(req, res, next) {
  req.cookies = parseCookies(req.headers.cookie);
  req.currentUser = null;
  res.locals.currentUser = null;

  // Antigraity, Gemini 3.1 Pro (high), Google.
  if (req.cookies.flash_msg) {
    res.locals.flashMsg = req.cookies.flash_msg;
    res.clearCookie('flash_msg');
  }
  // end: Antigraity, Gemini 3.1 Pro (high), Google.

  if (!req.cookies.cream_user) {
    return next();
  }

  try {
    const user = await User.findById(req.cookies.cream_user);
    if (user) {
      req.currentUser = user;
      res.locals.currentUser = user;
    }
  } catch (error) {
    res.clearCookie('cream_user');
  }

  next();
}

module.exports = attachCurrentUser;
//end: Codex, GPT-5.5 High, OpenAI.
