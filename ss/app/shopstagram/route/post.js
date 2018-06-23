const extendUserId = user_id => _ => extend(_, {
  user_id,
  created_at: new Date,
  updated_at: new Date
});

App.post('/api/posts', (req, res) => {
  const user = req.session.user;
  go(
    req.body,
    pick(['body']),
    extendUserId(user.id),
    _ => QUERY1(INSERT `posts` (_), RALL),
    post => extend(post, { _: { user, comments: [] } }),
    res.json
  )
});

App.post('/api/comments', (req, res) => {
  const user = req.session.user;
  go(
    req.body,
    pick(['body', 'post_id']),
    extendUserId(user.id),
    _ => QUERY1(INSERT `comments` (_), RALL),
    comment => extend(comment, { _: { user } }),
    res.json
  )
});

