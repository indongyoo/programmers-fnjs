!function() {
  const editor = {
    init: _ => go(
      $('.create_post'),
      $.on('click', e => match (Post.editor.show())
        .case (a => a) (
          push2($.status('posts')),
          Tmpl.post.item,
          $.el,
          $.prepend($('.post_list > .body'))
        ).else (noop))
    ),
    show: post => new Promise(resolve => go(
      html`
        <div class="post_editor">
          <div class="container">
            <div class="header">
              <h2>에디터</h2>
              <button type="button" class="cancel">취소</button>
              <button type="button" class="done">완료</button>
            </div>
            <div class="body">
              <textarea name="body" placeholder="내용을 입력해주세요...">${post && post.body}</textarea>
            </div>  
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
        post ?
          pipe(_ => defaults(_, post), $.put('/api/posts')) :
          $.post('/api/posts'),
        resolve,
        _ => $.remove(dt)))
    ))
  };

  const baseRemover = (buttonSelector, targetSelector, url) =>
    $.on('click', buttonSelector, e => go(
      e.currentTarget,
      $.closest(targetSelector),
      tap(
        $.statusAndParent,
        ([child, parent]) => go(
          child,
          pick(['id']),
          $.delete(url),
          _ => remove(child, parent))),
      $.remove
    ));

  const list = {
    init: _ => go(
      $('.post_list'),

      $.on('click', '.post_item > .options .edit', e => {
        const postItem = $.closest('.post_item', e.currentTarget);
        const post = $.status(postItem);
        go(
          post,
          Post.editor.show,
          _ => extend(post, _),
          ({body, updated_at}) => go(
            postItem,
            tap(
              $.find('.post_body'),
              $.setHtml(Tmpl.post.tags(body))),
            $.find('.updated_at'),
            $.setText(Dates.word(updated_at))
          )
        );
      }),

      $.on('click', '.more', e => {
        const posts = $.status(e.delegateTarget);
        match ($.get('/api/posts', { offset: posts.length }))
          .case({ length: 0 }) (
            _ => e.currentTarget,
            $.remove)
          .else (
            each(push2(posts)),
            map(Tmpl.post.item),
            map($.el),
            each($.append($('.post_list > .body'))));
      }),

      baseRemover(
        '.post_item > .options .remove',
        '.post_item',
        '/api/posts'
      ),

      baseRemover(
        '.comment_item > .options .remove',
        '.comment_item',
        '/api/comments'
      ),

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