Tmpl.post = {};

Tmpl.post.tags = body =>
  body.replace(
    /#[^\s#,;.]+/gm,
    tag =>`<a href="/tags/${tag.substr(1)}">${tag}</a>`);

Tmpl.post.item = post => html`
  <div class="post_item" post_id="${post.id}" status="> #${post.id}">
    <div class="user">
      <a href="/@/${post.user_id}" class="name">${post._.user.name}</a>
    </div>
    <p>
      <a href="/@/${post.user_id}" class="name">${post._.user.name}</a>
      <span class="post_body">${Tmpl.post.tags(post.body)}</span>
    </p>
    <div class="comment_list" status="> _ > comments">
      ${map(Tmpl.post.comment.item, post._.comments)}
    </div>
    <div class="updated_at">${Dates.word(post.updated_at)}</div>
    <div class="comment_editor">
      <input type="text" placeholder="댓글 달기..." name="body">
    </div>
    ${post._.is_login_user ? `
    <div class="options">
        <button type="button" class="edit">수정</button>    
        <button type="button" class="remove">삭제</button>
    </div>` : ''}
  </div>
`;

Tmpl.post.comment = {};
Tmpl.post.comment.item = comment => html`
  <div class="comment_item" status="> #${comment.id}">
    <p>
      <a href="/@/${comment.user_id}" class="name">${comment._.user.name}</a>
      <span>${Tmpl.post.tags(comment.body)}</span>
    </p>
    ${comment._.is_login_user ? `
    <div class="options">
        <button type="button" class="remove">x</button>
    </div>` : ''}
  </div>
`;
