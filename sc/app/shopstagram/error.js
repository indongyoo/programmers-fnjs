App.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

App.use(function(err, req, res, next) {
  if (!req.url.match('/api') && !DEV) return res.redirect('/');

  res.status(err.status || 500);
  res.send(err.message);
});