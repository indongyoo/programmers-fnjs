require('./accounts');

App.use((req, res, next) =>
  req.session.user ?
    next() :
    res.redirect('/signup')
);

require('./home');
require('./post');
