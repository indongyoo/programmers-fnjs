App.get('/', async (req, res) => {
  if (!req.session.user) return res.redirect('/signup');

  const posts = await Post.SELECT();

  res.send(Tmpl.layout.hbf({
    body: html`
      <div class="options">
        <button type="button" class="create_post">글 작성</button>
      </div>
      <div class="post">
        <div class="post_list" status="posts">
          ${map(Tmpl.post.item, posts)}
        </div>
        <button type="button" class="more">더보기</button>
      </div>
    `,
    scripts: `
      <script>
        Post.editor.init();
        Post.list.init();
        $.Status.data = {
          posts: ${JSON.stringify(posts)}
        }
      </script>
    `
  }));
});