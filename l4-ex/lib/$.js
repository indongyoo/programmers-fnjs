!function() {
  const { curry, first, pipe } = Functional;

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

  $.on = function on(el, event, f) {
    if (arguments.length == 2) return el => $.on(el, ...arguments);
    return el.addEventListener(event, f);
  };

  $.remove = el => el.parentNode.removeChild(el);

  $.text = el => el.textContent;

  $.setVal = curry((value, el) => el.value = value);

  window.$ = $;
} ();