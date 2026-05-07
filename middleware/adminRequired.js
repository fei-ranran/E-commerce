function adminRequired(req, res, next) {
  if (!req.currentUser) return res.redirect('/login');
  if (req.currentUser.role !== 'admin') return res.redirect('/');
  next();
}

module.exports = adminRequired;
