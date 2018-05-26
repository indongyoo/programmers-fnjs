const identity = a => a;

function gen(g) {
  return function(v) {
    const target = g(v);
    return { target, next: () => target.next(), [Symbol.iterator]() { return this; } }
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
    reduce((res, a) => then2(f(a), b => f1(res, a, b)), coll, []) :
    reduce((res, [k, a]) => then2(f(a), b => f2(res, k, a, b)), entriesIter(coll), {});

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

const log = console.log;

const not = a => then2(a, a => !a);

const reject = (f, coll) => filter(a => not(f(a)), coll);

const compact = (coll) => filter(identity, coll);






