!function() {
  function $(sel, parent = document) {
    return parent.querySelector(sel);
  }

  $.all = (sel, parent = document) => parent.querySelectorAll(sel);

  $.find = curry($);

  $.findAll = curry($.all);

  $.closest = curry((sel, el) => el.closest(sel));

  $.els = htmlStr => {
    const container = document.createElement('div');
    container.innerHTML = htmlStr;
    return container.children;
  };

  $.el = pipe($.els, first);

  $.append = curry((parent, child) => parent.appendChild(child));

  $.prepend = curry((parent, child) => parent.insertBefore(child, parent.firstChild));

  $.on = function(el, event, sel, f, ...opts) {
    if (typeof el == 'string') return el => $.on(el, ...arguments);
    if (typeof sel != 'string') return el.addEventListener(event, sel, f);

    el.addEventListener(event, e => go(
      el,
      $.findAll(sel),
      find(el => el.contains(e.target)),
      currentTarget =>
        currentTarget &&
        f(defaults({ originalEvent: e, currentTarget, delegateTarget: el }, e))
    ));
    return el;
  };

  $.remove = el => el.parentNode.removeChild(el);

  $.text = el => el.textContent;

  $.setVal = curry((value, el) => el.value = value);
  $.val = el => el.value;

  $.attr = curry((kv, el) =>
    isString(kv) ?
      el.getAttribute(kv) :
    isArray(kv) ?
      el.setAttribute(...kv) :
    (each(kv => el.setAttribute(...kv), entriesIter(kv)), el)
  );

  $.toJSON = pipe(
    $.findAll('[name]'),
    map(el => ({ [$.attr('name', el)]: $.val(el) })),
    (_) => extend(..._)
  );

  const resJSON = function(res) {
    return res.ok ? res.json() : Promise.reject(res);
  };

  const fetchBaseOpt = {
    headers: { "Content-Type": "application/json" },
    credentials: 'same-origin'
  };

  const fetchWithBody = method => curry((url, data) => go(
    fetch(url, Object.assign({
      method: method,
      body: JSON.stringify(data)
    }, fetchBaseOpt)),
    resJSON));

  $.post = fetchWithBody('POST');
  $.put = fetchWithBody('PUT');
  $.delete = $.del = fetchWithBody('DELETE');

  $.param = pipe(
    reject(isUndefined),
    entriesIter,
    map(pipe(map(encodeURIComponent), ([k, v]) => `${k}=${v}`)),
    str => str.join('&').replace(/%20/g, '+')
  );

  window.$ = $;
} ();

