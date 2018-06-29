App.get('/', async (req, res) => {
  if (!req.session.user) return res.redirect('/signup');

  const posts = await Post.SELECT(req.query, req.session.user.id);

  res.send(Tmpl.layout.hbf({
    body: html`
      <div class="options">
        <button type="button" class="create_post">글 작성</button>
      </div>
      <div class="post">
        <div class="post_list" status="posts">
          <div class="body">
            ${map(Tmpl.post.item, posts)}          
          </div>          
          <button type="button" class="more">더보기</button>
        </div>
      </div>
    `,
    scripts: `
      <script>
        $.Status.data = { posts: ${JSON.stringify(posts)} };
        Post.editor.init();
        Post.list.init();
      </script>
    `
  }));
});

App.get('/tags/:tag', async (req, res) => {
  const posts = await Post.SELECT(
    req.query,
    req.session.user.id,
    req.params.tag);

  res.send(posts);
});






