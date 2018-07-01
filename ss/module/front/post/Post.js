!function() {
  const editor = {
    init: _ => go(
      $('.create_post'),

      $.on('click', e => match (Post.editor.show())
        .case (a => a) (
          tap(post => $.status('posts').unshift(post)),
          Tmpl.post.item,
          $.el,
          $.prepend($('.post_list'))
        ).else (noop))
    ),
    show: _ => new Promise(resolve => go(
      _,
      _ => `
        <div class="post_editor">
          <div class="container">
            <div class="header">
              <h2>에디터</h2>
              <button type="button" class="cancel">취소</button>
              <button type="button" class="done">완료</button>
            </div>
            <div class="body"><textarea name="body"></textarea></div>
          </div>
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
      $('.post'),

      $.on('click', '.more', e => go(
        { offset: $.status('posts > length') },
        $.get('/api/posts'),
        match
          .case({length: 0}) (
            _ => e.currentTarget,
            $.remove)
          .else (
            each(push2($.status('posts'))),
            map(Tmpl.post.item),
            map($.el),
            each($.append($('.post_list'))))
      )),

      $.on('keyup', '.comment_editor input', match.case({ keyCode: 13 }) (
        (
          {currentTarget: ct},
          body = $.val(ct),
          postItem = $.closest('.post_item', ct),
          post = $.status(postItem),
          post_id = post.id,
          commentList = $.find('.comment_list', postItem)
        ) => go(
          { body, post_id },
          $.post('/api/comments'),
          push2(post._.comments),
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