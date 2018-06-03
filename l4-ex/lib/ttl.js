!function() {
  const { go, isUndefined, reduce, map, isArray } = Functional;

  function html(strs, ...vals) {
    return go(vals,
      map(v => isArray(v) ? v.join('') : isUndefined(v) ? '' : v),
      (vals, i=0) => reduce((res, str) => `${res}${vals[i++]}${str}`, strs));
  }

  window.Ttl = {
    html
  };
} ();