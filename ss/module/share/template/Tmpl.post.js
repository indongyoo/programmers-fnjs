Tmpl.post = {};

Tmpl.post.item = post => html`
  <div class="post_item" status="> #${post.id}">
    <div class="user">
      <a href="/@/${post.user_id}" class="name">${post._.user.name}</a>
    </div>
    <p>
      <a href="/@/${post.user_id}" class="name">${post._.user.name}</a>
      <span>${post.body}</span>
    </p>
    <div class="comment_list" status="> _ > comments">
      ${map(Tmpl.post.comment.item, post._.comments)}
    </div>
    <div class="created_at">${Dates.word(post.created_at)}</div>
    <div class="comment_editor">
      <input type="text" placeholder="댓글 달기..." name="body">
    </div>
  </div>
`;

Tmpl.post.comment = {};
Tmpl.post.comment.item = comment => html`
  <div class="comment_item" status="> #${comment.id}">
    <p>
      <a href="/@/${comment.user_id}" class="name">${comment._.user.name}</a>
      <span>${comment.body}</span>
    </p>
  </div>
`;
