!function() {
  const identity = a => a;

  const call = (f, arg) => f(arg);

  const call2 = (arg, f) => f(arg);

  const clear = console.clear;

  const log = console.log;

  const curry = f => (a, ..._) => _[0] === undefined ? (..._) => f(a, ..._) : f(a, ..._);

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

  const alterIter = alter => coll =>
    hasIter(coll) ? coll[Symbol.iterator]() : alter(coll);

  const collIter = alterIter(valuesIter);

  const reduce = curry(function(f, coll, acc) {
    const iter = collIter(coll);
    acc = arguments.length == 2 ? iter.next().value : acc;
    for (const a of iter)
      acc = acc instanceof Promise ? acc.then(acc => f(acc, a)) : f(acc, a);
    return acc;
  });

  class Break {
    constructor(value) { this.value = value; }
    static of(value) { return new Break(value); }
  }

  const reduceB = curry(function(f, coll, acc) {
    const iter = collIter(coll);
    return go(
      arguments.length == 2 ? iter.next().value : acc,
      function recur(acc) {
        var cur;
        while (!(cur = iter.next()).done && !(acc instanceof Break))
          if ((acc = f(acc, cur.value, Break.of)) instanceof Promise)
            return acc.then(recur);
        return acc instanceof Break ? acc.value : acc;
      });
  });

  const each = curry((f, coll) => go(reduce((_, a) => f(a), coll, null), _ => coll));

  function push(arr, v) {
    arr.push(v);
    return arr;
  }

  const set = (obj, k, v) => (obj[k] = v, obj);

  const baseMFIter = (f1, f2) => curry((f, iter, acc = (hasIter(iter) ? [] : {})) =>
    Array.isArray(acc) ?
      reduce((res, a) => go(a, f, b => f1(res, a, b)), iter, acc) :
      reduce((res, [k, a]) => go(a, f, b => f2(res, k, a, b)), iter, acc));

  const mapIter = baseMFIter(
    (res, a, b) => push(res, b),
    (res, k, a, b) => set(res, k, b));

  const filterIter = baseMFIter(
    (res, a, b) => b ? push(res, a) : res,
    (res, k, a, b) => b ? set(res, k, a) : res);

  const map = curry((f, coll) =>
    hasIter(coll) ? mapIter(f, coll, []) : mapIter(f, entriesIter(coll), {}));

  const filter = curry((f, coll) =>
    hasIter(coll) ? filterIter(f, coll, []) : filterIter(f, entriesIter(coll), {}));

  const countBy = curry((f, coll) => reduce((counts, a) => incSel(counts, f(a)), coll, {}));

  const groupBy = curry((f, coll) => reduce((group, a) => pushSel(group, f(a), a), coll, {}));

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

  const pipe = (f, ...fs) => (..._) => reduce(call2, fs, f(..._));

  const tap = (...fs) => arg => go(arg, ...fs, _ => arg);

  function pipeT(f, ...fs) {
    var catchF = tap(console.error), finallyF = identity, interceptors = [];

    const hook = (f, args) => go(
      find(itc => itc.predi(...args), interceptors),
      itc => itc ?
        Break.of(itc.body(...args)) :
        tryCatch(f, args, e => Break.of(catchF(e))));

    fs.push(identity);
    return Object.assign((...args) => go(
      reduceB((arg, f) => hook(f, [arg]), fs, hook(f, args)),
      finallyF
    ), {
      catch(...fs) {
        catchF = pipe(...fs);
        return this;
      },
      finally(...fs) {
        finallyF = pipe(...fs);
        return this;
      },
      addInterceptor(...fs) {
        var itc = { predi: pipe(...fs) };
        return (...fs) => {
          itc.body = pipe(...fs);
          interceptors.push(itc);
          return this;
        }
      }
    })
  }

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

  const none = curry(pipe(find, isUndefined));

  const some = curry(pipe(none, not));

  const every = curry((f, coll) => {
    var t = false;
    return go(find(pipe(f, not, b => (t = true, b)), coll), isUndefined, r => r && t);
  });

  const alterEntriesIter = alterIter(entriesIter);

  const mapC = curry((f, coll, limit = Infinity) => {
    const iter = stepIter(alterEntriesIter(coll), limit),
      isArr = hasIter(coll),
      res = isArr ? [] : {};
    const recur = pipe(
         _ => mapIter(a => [f(a)], iter, isArr ? [] : {}),
      coll => mapIter(([b]) => b, alterEntriesIter(coll), res),
       res => iter.remain ? recur() : res);
    return recur();
  });

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

  const noneC = curry(pipe(findC, isUndefined));

  const someC = curry(pipe(noneC, not));

  const everyC = curry((f, coll, limit) => {
    var t = false;
    return go(findC(pipe(f, not, b => (t = true, b)), coll, limit), isUndefined, r => r && t);
  });

  const series = map(call);

  const concurrency = mapC(call);

  const isArray = Array.isArray;

  const isMatch = curry((a, b) =>
    typeof a == 'function' ? !!a(b)
    :
    isArray(a) && isArray(b) ? every(v => b.includes(v), a)
    :
    typeof b == 'object' ? every(([k, v]) => b[k] == v, entriesIter(a))
    :
    a == b
  );

  const findWhere = curry((w, coll) => find(isMatch(w), coll));

  function baseMatch(targets) {
    var cbs = [];

    function _evl() {
      return go(cbs,
        find(pb => { return pb._case(...targets); }),
        pb => pb._body(...targets))
    }

    function _case(f) {
      cbs.push({ _case: typeof f == 'function' ? pipe(...arguments) : isMatch(f) });
      return _body;
    }
    _case.case = _case;

    function _body() {
      cbs[cbs.length-1]._body = pipe(...arguments);
      return _case;
    }

    _case.else = function() {
      _case(_=> true) (...arguments);
      return targets ? _evl() : (...targets2) => ((targets = targets2), _evl());
    };

    return _case;
  }

  const match = (..._) => baseMatch(_);
  match.case = (..._) => baseMatch(null).case(..._);

  const or = (...fs) => {
    const last = fs.pop();
    return (...args) =>
      go(fs,
        findVal(pipe(
          f => f(...args),
          a => a ? a : undefined)),
        a => a ? a : last(...args))
  };

  const and = (...fs) => {
    const last = fs.pop();
    return (...args) =>
      go(fs,
        findVal(pipe(
          f => f(...args),
          a => a ? undefined : a)),
        a => a === undefined ? last(...args) : a)
  };

  const flip = f => (..._) => f(..._.reverse());

  const baseSel = sep => curry((selector, acc) =>
    isArray(selector) ?
      reduce(flip(baseSel(sep)), selector, acc)
    :
    typeof selector == 'object' || typeof selector == 'function' ?
      findWhere(selector, acc)
    :
    reduce(
      (acc, key, tk = key.trim(), s = tk[0]) =>
        !acc ? acc :
        s == '#' ? findWhere({ id: tk.substr(1) }, acc) :
        s == '[' || s == '{' ? findWhere(JSON.parse(tk), acc) :
        acc[tk],
      selector.split(sep),
      acc)
  );

  const sel = baseSel(' > ');

  const first = arr => arr[0];

  var Functional = {
    identity, not, negate,
    isUndefined, hasIter, isArray,
    isMatch,
    call, call2,
    clear, log,
    curry, flip,
    valuesIter, entriesIter, reverseIter,
    collIter,
    reduce, countBy, groupBy,
    reduceB, Break,
    go, pipe, tap, pipeT,
    each,
    push, set,
    mapIter, filterIter,
    map, values,
    mapC,
    filter, reject, compact,
    findVal, find, none, some, every, findWhere,
    findValC, findC, noneC, someC, everyC,
    series, concurrency,
    match, or, and,
    baseSel, sel,
    first
  };
  window.Functional = Functional;
} ();