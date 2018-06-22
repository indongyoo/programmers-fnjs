App.get('/', async function(req, res) {
  if (!req.session.user) return res.redirect('/signup');

  const user = await QUERY1(
    SELECT `*`, FROM `users`, WHERE `id = ${req.session.user.id}`);

  const posts = await go(
    QUERY(
      SELECT `*`, FROM `posts`, `ORDER BY ID DESC`),
    each(p => p._ = {}));

  await go(
    QUERY(
      SELECT `*`, FROM `users`, WHERE `id in ${map(p => p.user_id, posts)}`),
    indexBy(u => u.id),
    users => each(p => p._.user = users[p.user_id], posts));

  const comments = await go(
    QUERY(
      SELECT `*`, FROM `comments`, WHERE `post_id in ${map(p => p.id, posts)}`),
    each(c => c._ = {}));

  await go(
    QUERY(
      SELECT `*`, FROM `users`, WHERE `id in ${map(p => p.user_id, comments)}`),
    indexBy(u => u.id),
    users => each(p => p._.user = users[p.user_id], comments));

  go(comments,
    groupBy(c => c.post_id),
    comments => each(p => p._.comments = comments[p.id] || [], posts));

  go(
    {
      user,
      body: html`
        <div class="post_area">
          <div class="post_list" status="posts">
            ${map(Tmpl.post.item, posts)}
          </div>
        </div>
        <div class="user">${user.name}</div>
        <div class="story_area">
          <div class="story_list"></div>
        </div>
      `,
      scripts: [`
        <script>
          $.Status = { 
            user: ${JSON.stringify(user)}, 
            posts: ${JSON.stringify(posts)}
          };
        </script>
        <script>
          Post.list.init();
        </script>  
      `]
    },
    Tmpl.layout.hbf,
    res.send
  );
});

