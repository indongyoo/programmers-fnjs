const identity = a => a;

const collIter = coll =>
  coll.constructor == Object ?
    valuesIter(coll) :
    coll[Symbol.iterator]();

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

const then1 = f => a => a instanceof Promise ? a.then(f) : f(a);
const then2 = (f, a) => a instanceof Promise ? a.then(f) : f(a);

function reduce(f, coll, acc) {
  return then2(function(coll) {
    const iter = collIter(coll);
    acc = acc === undefined ? iter.next().value : acc;
    return then2(function recur(acc) {
      for (const v of iter) {
        acc = f(acc, v);
        if (acc instanceof Promise) return acc.then(recur);
      }
      return acc;
    }, acc);
  }, coll);
}

(async function() {
  console.log(
    await reduce((a, b) => a + b, Promise.resolve([1, 2, 3]))
  );
}) ();

reduce((a, b) => a + b, Promise.resolve([1, 2, 3, 4])).then(console.log)

console.log(
  reduce((a, b) => a + b, [1, 2, 3])
);

reduce((a, b) => Promise.resolve(a + b), [10, 20, 30]).then(console.log);
reduce((a, b) => Promise.resolve(a + b), Promise.resolve([10, 20, 30])).then(console.log);

reduce(
  (a, b) => Promise.resolve(a + b),
  Promise.resolve([10, 20, 30]),
  Promise.resolve(10))

  .then(console.log);








const countBy = (f, coll) => reduce((counts, a) => incSel(counts, f(a)), coll, {});

const count = coll => countBy(identity, coll);

const groupBy = (f, coll) => reduce((group, a) => pushSel(group, f(a), a), coll, {});

function incSel(parent, k) {
  parent[k] ? parent[k]++ : parent[k] = 1;
  return parent;
}

function pushSel(parent, k, v) {
  (parent[k] || (parent[k] = [])).push(v);
  return parent;
}

// console.log(
//   reduce((acc, a) => acc + a, [1, 2, 3], 0)
// );
//
// console.log(
//   reduce((acc, a) => acc + a, { a: 1, b: 2, c: 3 }, 0)
// );
//
// console.log(
//   reduce((a, b) => a - b, reverseIter([1, 2, 3, 4]))
// );

// const posts = [
//   { id: 1, body: '내용1', comments: [{}, {}] },
//   { id: 2, body: '내용2', comments: [{}] },
//   { id: 3, body: '내용3', comments: [{}, {}, {}] },
//   { id: 4, body: '내용4', comments: [{}, {}, {}] },
// ];

// 모든 posts를 통해서 comments의 총 수를 얻어주세요.

// console.log(
//   reduce((count, p) => count + p.comments.length, posts, 0)
// );
//
// const users = [
//   { id: 1, name: 'name1', age: 30 },
//   { id: 2, name: 'name2', age: 31 },
//   { id: 3, name: 'name3', age: 32 },
//   { id: 4, name: 'name4', age: 31 },
//   { id: 5, name: 'name5', age: 32 }
// ];
//
// console.log(
//   reduce((group, u) => pushSel(group, u.age, u), users, {})
// );
//
//
// console.log( groupBy(u => u.age, users) );
//
// const res = {
//   30: [{ id: 1, name: 'name1', age: 30 }],
//   31: [{ id: 2, name: 'name2', age: 31 }, { id: 4, name: 'name4', age: 31 }],
//   32: [{ id: 3, name: 'name3', age: 32 }, { id: 5, name: 'name5', age: 32 }]
// };

// reduce((counts, a) => incSel(counts, a.age), users, {});

// console.log(
//   countBy(u => u.age, users)
// );
//
// console.log(
//   countBy(identity, [1, 2, 3, 3, 4, 5, 5, 10, 10, 10])
// );
//
// console.log(
//   count([1, 2, 3, 3, 4, 5, 5, 10, 10, 10])
// );
//
// console.log(
//   groupBy(identity, [1, 2, 3, 3, 4, 5, 5, 10, 10, 10])
// );
//





















