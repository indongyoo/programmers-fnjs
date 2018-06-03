!function() {
  const { map, curry, go, tap } = Functional;
  const { html } = Ttl;

  const Ui = {};

  Ui.msg = curry((buttons, msg) => new Promise(resolve => go(
    html`
      <div class="ui_msg">
        <div class="body">
          <div class="msg">${msg}</div>
          <div class="buttons">
            ${map(b => `
              <button type="button" class="${b.type}">${b.name}</button>
            `, buttons)}
          </div>
        </div>
      </div>
    `,
    $.el,
    tap(alertEl =>
      go(buttons,
        each(b => go(
          alertEl,
          $.find(`button.${b.type}`),
          $.on('click', e => {
            $.remove(alertEl);
            resolve(b.result);
          })
        )))),
    $.append($('body'))
  )));

  Ui.alert = Ui.msg([{
    name: '확인', result: true, type: 'done' }]);

  Ui.confirm = Ui.msg([
    { name: '취소', result: false, type: 'cancel' },
    { name: '확인', result: true, type: 'done' }]);

  window.Ui = Ui;
} ();