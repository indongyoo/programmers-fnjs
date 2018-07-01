const bodyToTags = body => go(
  body.match(/#[^\s,;.]+/gm),
  compact,
  map(k => k.substr(1)),
  JSON.stringify
);

const extendOtherInfo = user_id => _ => extend(_, {
  user_id,
  created_at: new Date,
  updated_at: new Date,
  tags: bodyToTags(_.body)
});

App.get('/api/posts', (req, res) =>
  go(Post.SELECT(req.query, req.session.user.id), res.json));

App.post('/api/posts', (req, res) => {
  const user = req.session.user;
  go(
    req.body,
    pick(['body']),
    extendOtherInfo(user.id),
    _ => QUERY1(INSERT `posts` (_), RALL),
    post => extend(post, { _: { user, comments: [], is_login_user: true } }),
    res.json
  )
});

App.put('/api/posts', (req, res) => {
  const { id, body } = req.body;
  const condition = { id, user_id: req.session.user.id };

  go(
    QUERY1(
      UPDATE `posts` ({ body, updated_at: new Date, tags: bodyToTags(body) }),
        WHERE `${condition}`,
        RALL),
    res.json);
});

App.delete('/api/posts', (req, res) => {
  const { id } = req.body;
  const condition = { id, user_id: req.session.user.id };

  go(
    match (QUERY1('SELECT id FROM posts', WHERE `${condition}`))
      .case(a => a) (
        _ => QUERY1(Q`DELETE FROM comments where post_id = ${id}`),
        _ => QUERY1(Q`DELETE FROM posts where id = ${id}`),
        _ => true)
      .else(Boolean),
    res.json
  )
});

App.post('/api/comments', (req, res) => {
  const user = req.session.user;
  go(
    req.body,
    pick(['body', 'post_id']),
    extendOtherInfo(user.id),
    _ => QUERY1(INSERT `comments` (_), RALL),
    comment => extend(comment, { _: { user, is_login_user: true } }),
    res.json
  )
});

App.delete('/api/comments', (req, res) => {
  const { id } = req.body;
  const condition = { id, user_id: req.session.user.id };

  go(
    QUERY1('DELETE FROM comments', WHERE `${condition}`),
    Boolean,
    res.json)
});
