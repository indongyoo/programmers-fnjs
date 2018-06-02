!function() {
  const { go } = Functional;

  function alert(msg) {
    return new Promise(resolve => {
      go(
        `
          <div class="alert">
            <div class="body">
              <div class="msg">${msg}</div>
            </div>
            <div class="buttons">
              <button type="button" class="done">확인</button>
            </div>
          </div>
        `,
        $.el,
        $.append($('body')),
        el => {
          $('button.done', el).addEventListener('click', function() {
            el.parentNode.removeChild(el);
            resolve();
          });
        }
      )
    });
  }

  function confirm(msg) {
    return new Promise(resolve => {
      go(
        `
          <div class="alert">
            <div class="body">
              <div class="msg">${msg}</div>
            </div>
            <div class="buttons">
              <button type="button" class="cancel">취소</button>
              <button type="button" class="done">확인</button>
            </div>
          </div>
        `,
        $.el,
        $.append($('body')),
        el => {
          $('button.cancel', el).addEventListener('click', function() {
            el.parentNode.removeChild(el);
            resolve(false);
          });
          $('button.done', el).addEventListener('click', function() {
            el.parentNode.removeChild(el);
            resolve(true);
          });
        }
      )
    });
  }

  window.Ui = {
    alert,
    confirm
  };
} ();