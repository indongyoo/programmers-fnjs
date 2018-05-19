const identity = a => a;

function gen(g) {
  return function(v) {
    const iter = g(v);
    return { next: () => iter.next(), [Symbol.iterator]() { return this; } }
  }
}

const valuesIter = gen(function *(obj) {
  for (const k in obj) yield obj[k];
});

const entriesIter = gen(function *(obj) {
  for (const k in obj) yield [k, obj[k]];
});

const reverseIter = gen(function *(arr) {
  var l = arr.length;
  while (l--) yield arr[l];
});

const hasIter = coll => !!coll[Symbol.iterator];

const collIter = coll =>
  hasIter(coll) ?
    coll[Symbol.iterator]() :
    valuesIter(coll);

const then = (f, a) => a instanceof Promise ? a.then(f) : f(a);
const then2 = (a, f) => a instanceof Promise ? a.then(f) : f(a);

function reduce(f, coll, acc) {
  return then(function(coll) {
    const iter = collIter(coll);
    acc = acc === undefined ? iter.next().value : acc;
    return then(function recur(acc) {
      for (const v of iter) {
        acc = f(acc, v);
        if (acc instanceof Promise) return acc.then(recur);
      }
      return acc;
    }, acc);
  }, coll);
}

function push(arr, v) {
  arr.push(v);
  return arr;
}

const set = (obj, k, v) => (obj[k] = v, obj);

const baseMF = (f1, f2) => (f, coll) =>
  hasIter(coll) ?
    reduce(f1(f), coll, []) :
    reduce(f2(f), entriesIter(coll), {});

const map = baseMF(
  f => (res, a) => then2(f(a), b => push(res, b)),
  f => (res, [k, a]) => then2(f(a), b => set(res, k, b))
);

const filter = baseMF(
  f => (res, a) => then2(f(a), b => b ? push(res, a) : res),
  f => (res, [k, a]) => then2(f(a), b => b ? set(res, k, a) : res)
);

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