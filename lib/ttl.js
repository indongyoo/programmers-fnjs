function html(strs, ...vals) {
  var i = -1;
  return go(vals,
    map(identity),
    vals => reduce((res, str) => `${res}${html.join(vals[++i])}${str}`, strs));
}