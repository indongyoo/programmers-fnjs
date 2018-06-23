!function() {
  const editor = {
    init: _ => go(
      $('.create_post'),

      $.on('click', e => match (Post.editor.show())
        .case (a => a) (
          Tmpl.post.item,
          $.el,
          $.prepend($('.post_list'))
        ).else (noop))
    ),
    show: _ => new Promise(resolve => go(
      _,
      _ => `
        <div class="post_editor">
          <div class="header">
            <h2>에디터</h2>
            <button type="button" class="cancel">취소</button>
            <button type="button" class="done">완료</button>
          </div>
          <div class="body"><textarea name="body"></textarea></div>
        </div>
      `,
      $.el,
      $.append($('body')),
      $.on('click', '.cancel', e => {
        resolve();
        $.remove(e.delegateTarget);
      }),
      $.on('click', '.done', ({delegateTarget: dt}) => go(
        dt,
        $.toJSON,
        $.post('/api/posts'),
        resolve,
        _ => $.remove(dt)))
    ))
  };

  const list = {
    init: _ => go(
      $('.post_list'),
      $.on('keyup', '.comment_editor input', match.case({ keyCode: 13 }) (
        (
          {currentTarget: ct},
          body = $.val(ct),
          postItem = $.closest('.post_item', ct),
          post_id = $.attr('post_id', postItem),
          commentList = $.find('.comment_list', postItem)
        ) => go(
          { body, post_id },
          $.post('/api/comments'),
          Tmpl.post.comment.item,
          $.el,
          $.append(commentList),
          _ => ct,
          $.setVal('')
        ),
      ).else (noop))
    )
  };

  global.Post = {
    editor,
    list
  };
} ();