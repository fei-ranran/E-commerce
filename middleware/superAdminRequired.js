function superAdminRequired(req, res, next) {
  if (!req.currentUser) return res.redirect('/login');
  if (req.currentUser.role !== 'superadmin') return res.redirect('/');
  next();
}

module.exports = superAdminRequired;
