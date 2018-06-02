!function() {
  window.$ = $;

  const { curry } = Functional;

  function $(sel, parent = document) {
    return parent.querySelector(sel);
  }

  const append = curry(function(parent, child) {
    return parent.appendChild(child);
  });

  const join = v => isArray(v) ? v.join('') : v;

  function html(strs, ...vals) {
    var i = -1;
    return go(vals,
      map(identity),
      vals => reduce((res, str) => `${res}${join(vals[++i])}${str}`, strs));
  }

  function el(html) {
    return els(html)[0];
  }

  function els(html) {
    var container = document.createElement('div');
    container.innerHTML = html;
    return container.children;
  }


  Object.assign($, {
    html,
    el,
    els,
    append
  });
} ();