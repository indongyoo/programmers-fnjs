
function map(f, coll) {
  var res = [];
  var iter = coll[Symbol.iterator]();
  return function recur() {
    for (const v of iter) {
      const a = f(v);
      if (a instanceof Promise) {
        return a.then(function(a) {
          res.push(a);
          return recur();
        });
      } else {
        res.push(a);
      }
    }
    return res;
  } ();
}


function filter(f, coll) {
  var res = [];
  var iter = coll[Symbol.iterator]();
  for (const v of iter) {
    const a = f(v);
    if (a) res.push(v);
  }
  return res;
}

function filter(f, coll) {
  var res = [];
  var iter = coll[Symbol.iterator]();
  return function recur() {
    for (const v of iter) {
      const a = f(v);
      if (a instanceof Promise) {
        return a.then(function(a) {
          if (a) res.push(v);
          return recur();
        });
      } else {
        if (a) res.push(v);
      }
    }
    return res;
  } ();
}


console.log( map(a => a + 10, [1, 2, 3]) );
console.log( map(a => Promise.resolve(a + 10), [1, 2, 3]) );

map(a => Promise.resolve(a + 10), [1, 2, 3]).then(console.log);


// map(a => a + 10, Promise.resolve([1, 2, 3])).then(console.log);
//
// [11, 12, 13]


function map(f, coll) {
  var res = [];
  for (const v of coll) {
    res.push(f(v));
  }
  return res;
}

// function map(f, coll) {
//   return reduce((res, a) => {
//     const b = f(a);
//     return then2(function (b) {
//       res.push(b);
//       return res;
//     }, b);
//   }, coll, []);
// }

// function map(f, coll) {
//   return reduce((res, a) => then2(function (b) {
//     res.push(b);
//     return res;
//   }, f(a)), coll, []);
// }
