Tmpl.post = {};
!function() {
  const { html } = Ttl;

  Tmpl.post.item = post => html`
    <div class="post_item" status="> #${post.id}">
      <div class="user">
        <a href="/@/${post._.user.id}" class="name">${post._.user.name}</a>
      </div>
      <p>
        <a href="/@/${post._.user.id}" class="name">${post._.user.name}</a>
        <span class="body">${post.body}</span>
      </p>
      <div class="comment_list" status="> _ > comments">
        ${map(Tmpl.post.comment.item, post._.comments)}
      </div>
      <div class="created_at">${DateFns.format(post.created_at)}</div>
      <div class="comment_editor">
        <input type="text" placeholder="댓글 달기..." name="body">
      </div>
    </div>
  `;

  Tmpl.post.comment = {};
  Tmpl.post.comment.item = comment => html`
    <div class="comment_item" status="> #${comment.id}">
      <p>
        <a href="/@/${comment._.user.id}" class="name">${comment._.user.name}</a>
        <span class="body">${comment.body}</span>
      </p>
    </div>
  `;
} ();

