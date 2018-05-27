const identity = a => a;

const call = (f, arg) => f(arg);

const call2 = (arg, f) => f(arg);

const clear = console.clear;

const log = console.log;

const curry = f => (a, ..._) =>
  _.length == 0 ? (..._2) => f(a, ..._2) : f(a, ..._);

function *valuesIter(obj) {
  for (const k in obj) yield obj[k];
}

function *entriesIter(obj) {
  for (const k in obj) yield [k, obj[k]];
}

function *reverseIter(arr) {
  var l = arr.length;
  while (l--) yield arr[l];
}

const hasIter = coll => !!coll[Symbol.iterator];

const collIter = coll =>
  hasIter(coll) ?
    coll[Symbol.iterator]() :
    valuesIter(coll);

const reduce = curry(function(f, coll, acc) {
  const iter = collIter(coll);
  acc = acc === undefined ? iter.next().value : acc;
  for (const a of iter)
    acc = acc instanceof Promise ? acc.then(acc => f(acc, a)) : f(acc, a);
  return acc;
});

function push(arr, v) {
  arr.push(v);
  return arr;
}

const set = (obj, k, v) => (obj[k] = v, obj);

const baseMF = (f1, f2) => curry((f, coll) =>
  hasIter(coll) ?
    reduce((res, a) => go(a, f, b => f1(res, a, b)), coll, []) :
    reduce((res, [k, a]) => go(a, f, b => f2(res, k, a, b)), entriesIter(coll), {}));

const map = baseMF(
  (res, a, b) => push(res, b),
  (res, k, a, b) => set(res, k, b));

const filter = baseMF(
  (res, a, b) => b ? push(res, a) : res,
  (res, k, a, b) => b ? set(res, k, a) : res);

const countBy = (f, coll) => reduce((counts, a) => incSel(counts, f(a)), coll, {});

const groupBy = (f, coll) => reduce((group, a) => pushSel(group, f(a), a), coll, {});

function incSel(parent, k) {
  parent[k] ? parent[k]++ : parent[k] = 1;
  return parent;
}

function pushSel(parent, k, v) {
  (parent[k] || (parent[k] = [])).push(v);
  return parent;
}

const values = coll =>
  map(identity, coll instanceof Map ? coll.values() : collIter(coll));

const go = (...coll) => reduce(call2, coll);

const pipe = (...fs) => arg => reduce(call2, fs, arg);

const not = a => !a;
const negate = f => pipe(f, not);

const reject = curry((f, coll) => filter(negate(f), coll));

const compact = filter(identity);

const findVal = curry((f, coll) => {
  const iter = collIter(coll);
  return function recur(res) {
    var cur;
    while ((cur = iter.next()) && !cur.done) {
      if ((res = f(cur.value)) !== undefined)
        return go(res, res => res !== undefined ? res : recur());
    }
  } ();
});

const find = curry((f, coll) =>
  findVal(a => go(a, f, bool => bool ? a : undefined), coll));

const isUndefined = a => a === undefined;

const none = (f, coll) => go(find(f, coll), isUndefined);

const some = (f, coll) => go(none(f, coll), not);

const every = (f, coll) => go(find(negate(f), coll), isUndefined);

const mapC = curry((f, coll) =>
  go(coll,
    map(a => ({ val: f(a) })),
    map(b => b.val)));

const stepIter = (iter, limit) => {
  var i = 0;
  return {
    next: function() {
      if (i++ == limit) {
        i = 0;
        return { done: true };
      }
      const cur = iter.next();
      this.remain = !cur.done;
      return cur;
    },
    [Symbol.iterator]() { return this; },
    remain: true
  }
};

const findValC = curry((f, coll, limit = Infinity) => {
  const iter = stepIter(collIter(coll), limit);
  return new Promise(function recur(resolve) {
    var i = 0, j = 0;
    var cur;
    while ((cur = iter.next()) && !cur.done) {
      ++i;
      go(cur.value,
        f,
        b => b === undefined ? undefined : resolve(b),
        _ => i == ++j ? iter.remain ? recur(resolve) : resolve() : undefined);
    }
  });
});

const findC = curry((f, coll, limit) =>
  findValC(a => go(a, f, bool => bool ? a : undefined), coll, limit));

const noneC = (f, coll, limit) => go(findC(f, coll, limit), isUndefined);

const someC = (f, coll, limit) => go(noneC(f, coll, limit), not);

const everyC = (f, coll, limit) => go(findC(negate(f), coll, limit), isUndefined);

const series = map(f => f());
const concurrency = mapC(f => f());