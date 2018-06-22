!function() {
  const { html } = Ttl;

  const init = pipe(
    _ => $('.post_area'),

    $.on('keyup', '.comment_editor input',
      match
        .case({ keyCode: 13 }) ((
          { currentTarget: ct },
          post = $.status(ct),
          { _: { comments } } = post
        ) => go(
          { body: $.val(ct), post_id: post.id },
          $.post('/api/comments'),
          push2(comments),
          Tmpl.post.comment.item,
          $.el,
          $.append(go(
            ct,
            $.closest('.post_item'),
            $.find('.comment_list')
          )),
          _ => $.setVal('', ct)))
        .else(noop)
    )
  );

  Post.list = {
    init
  };
} ();