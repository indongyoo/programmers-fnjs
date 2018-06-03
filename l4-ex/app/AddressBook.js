!function() {
  const { log, go, map, tap, each } = Functional;

  const getAddresss = _ => new Promise(resolve => {
    setTimeout(function() {
      resolve([
        { id: 1, postcode: '1000', address: '경기도 고양시' },
        { id: 2, postcode: '2000', address: '경기도 성남시' },
      ]);
    }, 1000);
  });

  const AddressBook = {};
  AddressBook.import = _ => new Promise(resolve => go(
    null,
    getAddresss,
    addresss => html`
      <div class="address_book window">
        <div class="container">
          <div class="options">
            <button type="button" class="close">닫기</button>
          </div>
          <ul class="address_list">
          ${map(a => `
            <li>
              <div class="postcode">${a.postcode}</div>
              <div class="address">${a.address}</div>
              <button type="button" class="select">선택</button>
            </li>
          `, addresss)}
          </ul>
        </div>
      </div>
    `,
    $.el,
    $.append($('body')),
    tap(windowEl => go(windowEl,
      $.find('.options .close'),
      $.on('click', _ => {
        resolve();
        $.remove(windowEl);
      })
    )),
    tap(windowEl => go(windowEl,
      $.findAll('.address_list .select'),
      each($.on('click', e => go(
        e.currentTarget,
        $.closest('li'),
        el => ({
          postcode: go(el, $.find('.postcode'), $.text),
          address: go(el, $.find('.address'), $.text)
        }),
        resolve,
        _ => $.remove(windowEl)
      )))
    ))
  ));

  window.App.AddressBook = AddressBook;
} ();