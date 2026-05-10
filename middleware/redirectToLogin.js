// Redirect unauthenticated users to /login for non-public pages
module.exports = function redirectToLogin(req, res, next) {
  // If user already logged in, continue
  if (req.currentUser) return next();

  const path = req.path || '';

  // Allow public routes without authentication
  const PUBLIC_PREFIXES = ['/login', '/register', '/uploads', '/captcha', '/css', '/js', '/images', '/public', '/favicon.ico', '/favicon.svg', '/health'];
  for (const p of PUBLIC_PREFIXES) {
    if (path === p || path.startsWith(p + '/') || path.startsWith(p)) return next();
  }

  // Allow API endpoints that should be public (e.g., index, product listing) if desired
  // Currently we redirect all non-public pages to login
  return res.redirect('/login');
};
