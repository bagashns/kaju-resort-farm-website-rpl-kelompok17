function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  req.session.returnTo = req.originalUrl;
  req.flash('error', 'Silakan login terlebih dahulu.');
  res.redirect('/login');
}

function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  req.flash('error', 'Anda tidak memiliki akses ke halaman ini.');
  res.redirect('/');
}

function isCustomer(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'customer') {
    return next();
  }
  req.flash('error', 'Halaman ini khusus untuk pelanggan.');
  res.redirect('/');
}

module.exports = { isAuthenticated, isAdmin, isCustomer };
