!function() {
  const { html } = Ttl;

  const init = _ => go(
    $('.open_editor'),
    $.on('click', e =>
      match (show())
        .case(identity) (
          Tmpl.post.item,
          $.el,
          $.append($('.post_list'))
        )
        .else (noop)
    )
  );

  const show = _ => new Promise(resolve => go(
    html`
      <div class="post_editor">
        <div class="container">
          <div class="header">
            <button type="button" class="close">취소</button>
            <h2>글 작성</h2>
            <button type="button" class="done">확인</button>
          </div>
          <div class="body">
            <textarea name="body"></textarea>
          </div>
          <div class="photo_list">
            <form class="add_photo">
              <label>
                사진 추가
                <input type="file" name="file">
              </label>
            </form>
            <ul></ul>
          </div>
        </div>
      </div>
    `,
    $.el,
    $.append($('body')),
    $.on('click', '.close', e => {
      $.remove(e.delegateTarget);
      resolve();
    }),
    $.on('click', '.done', e => go(
      { body: go(e.delegateTarget, $.find('textarea'), $.val) },
      $.post('/api/posts'),
      resolve,
      _ => $.remove(e.delegateTarget)
    )),
  ));

  Post.editor = {
    init
  };
} ();