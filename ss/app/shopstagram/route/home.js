App.get('/', async (req, res) => {
  if (!req.session.user) return res.redirect('/signup');

  const posts = await QUERY(SELECT `*`, FROM `posts`, `ORDER BY id DESC`);

  await go(
    QUERY(
      SELECT `*`, FROM `users`, WHERE `id in ${map(p => p.user_id, posts)}`
    ),
    indexBy(u => u.id),
    users => each(p => p._ = { user: users[p.user_id] }, posts));

  const comments = await go(
    QUERY(
      SELECT `*`, FROM `comments`, WHERE `post_id in ${map(p => p.id, posts)}`
    ));

  await go(
    QUERY(
      SELECT `*`, FROM `users`, WHERE `id in ${map(p => p.user_id, comments)}`
    ),
    indexBy(u => u.id),
    users => each(c => c._ = { user: users[c.user_id] }, comments));

  await go(
    comments,
    groupBy(c => c.post_id),
    comments => each(p => p._.comments = comments[p.id] || [], posts));

  res.send(Tmpl.layout.hbf({
    body: html`
      <div class="options">
        <button type="button" class="create_post">글 작성</button>
      </div>
      <div class="post">
        <div class="post_list">
          ${map(Tmpl.post.item, posts)}
        </div>
      </div>
    `,
    scripts: `
      <script>
        Post.editor.init();
        Post.list.init();
        window.posts = ${JSON.stringify(posts)};
      </script>
    `
  }));
});