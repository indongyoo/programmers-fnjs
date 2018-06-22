App.post('/api/posts', (req, res) => go(
  req.body,
  pick(['body']),
  pipeT(
    post => QUERY1(INSERT `posts` (
      extend(post, {
        user_id: req.session.user.id,
        created_at: new Date
      })
    ), RALL)
  ),
  res.json
));

App.post('/api/comments', (req, res) => go(
  req.body,
  pick(['body', 'post_id']),
  pipeT(
    comment => QUERY1(INSERT `comments` (
      extend(comment, {
        user_id: req.session.user.id,
        created_at: new Date
      })
    ), RALL),
    _ => extend(_, { _: { user: req.session.user } })
  ),
  res.json
));