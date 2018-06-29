!function() {
  const { Pool } = require('pg');

  function isString(a) {
    return typeof a == 'string';
  }

  function PG_ARGS(...qs) {
    return PG_ARGS_ARR(qs);
  }

  function PG_ARGS_ARR(qs) {
    return [
      go(
        qs,
        map(q => isString(q) ? q : q.text),
        join(' '),
        text => text
          .split('??')
          .reduce((a, b, i) => `${a}$${i}${b}`)),
      go(
        qs,
        reject(isString),
        map(q => q.values),
        cat)
    ];
  }

  function query(pool, qs) {
    return go(
      PG_ARGS_ARR(qs),
      tap(log),
      qs => pool.query(...qs),
      res => res.rows
    );
  }

  async function CONNECT(info) {
    const pool = await new Pool(info);
    function QUERY(...qs) {
      return query(pool, qs);
    }

    function ASSOCIATE(strs, ...tails) {
      const assos = strs
        .map(s => s
          .replace(/\s*\n/, '')
          .split('\n')
          .map(s => {
            const depth = s.match(/^\s*/)[0].length;
            var as = s.replace(/\s*/g, '');
            if (as[0] == '-' || as[0] == '<') {
              var rel = as[0];
              as = as.substr(1);
            }
            return {depth, as, rel}
          }));

      var i = -1;
      go(
        tails,
        map(match
          .case(or(isString, a => a instanceof Query))(query => ({queries: [query]}))
          .case(isArray) (queries => ({queries}))
          .else(t => t)),
        each(t => go(
          assos[++i],
          last,
          _ => extend(_, t)
        ))
      );

      return go(assos,
        cat,
        function setting([parent, ...rest]) {
          const cur = [parent];
          parent.table = parent.table || parent.as;
          parent.queries = parent.queries || '';
          each(chlid => {
            while (!(last(cur).depth < chlid.depth)) cur.pop();
            var parent = last(cur);
            pushSel(parent, 'children', chlid);
            if (chlid.rel == '-') {
              chlid.table = chlid.table || chlid.as + 's';
              chlid.parent_key = chlid.parent_key || chlid.table.substr(0, chlid.table.length-1) + '_id';
              chlid.child_key = chlid.child_key || 'id';
            } else {
              chlid.table = chlid.table || chlid.as;
              chlid.parent_key = chlid.parent_key || 'id';
              chlid.child_key = chlid.child_key || parent.table.substr(0, parent.table.length-1) + '_id';
            }
            chlid.queries = chlid.queries || '';
            cur.push(chlid);
          }, rest);
          return parent;
        },
        async function(parent) {
          const {table, queries, children} = parent;

          const parent_rows = await QUERY(`SELECT * FROM ${table}`, ...queries);

          await each(child => fetchChild(parent_rows, parent, child), children);

          return parent_rows;

          async function fetchChild(parent_rows, parent, child) {
            if (!parent_rows.length) return;

            const {rel, as, table, parent_key, child_key, queries = ''} = child;

            var child_rows = await QUERY(
              `SELECT * FROM ${table}`,
              `WHERE ${child_key} in (${unique(map(a => a[parent_key], parent_rows))})`,
              ...queries);

            rel == '-' ?
              await go(
                child_rows,
                indexBy(a => a[child_key]),
                indexed => each(row => extend(row._ = row._ || {}, { [as]: indexed[row[parent_key]] || {} }), parent_rows)) :
              await go(
                child_rows,
                groupBy(a => a[child_key]),
                grouped => each(row => extend(row._ = row._ || {}, { [as]: grouped[row[parent_key]] || [] }), parent_rows));

            parent_rows = child_rows;
            parent = child;
            await each(child => fetchChild(parent_rows, parent, child), child.children || []);
          }
        }
      )
    }

    return {
      QUERY,
      QUERY1: pipe(QUERY, first),
      ASSOCIATE,
      async TRANSACTION() {
        const client = await pool.connect();
        await client.query('BEGIN');
        const end = query => _ => series([
          _ => client.query(query),
          _ => client.release()
        ]);
        return {
          QUERY_T(...qs) {
            return query(client, qs);
          },
          COMMIT: end('COMMIT'),
          ROLLBACK: end('ROLLBACK')
        }
      }
    }
  }

  function SELECT(strs, ...vals) {
    return {
      text: `SELECT ${strs[0]}`,
      values: vals,
    };
  }

  function FROM(strs, ...vals) {
    return {
      text: `FROM ${strs[0]}`,
      values: vals
    };
  }

  function quote(val) {
    return typeof val == 'string' ? `'${val}'` : val;
  }

  function cat(arr) {
    return [].concat(...arr);
  }

  function WHERE(strs, ...vals) {
    const text = `WHERE ${mix(strs, go(
      vals,
      map(match
        .case(isArray) (
          map(a => '??'),
          join(', '),
          a => `(${a})`)
        .case(a => typeof a == 'object') (
          map(a => '??'),
          Object.entries,
          map(([k, v]) => `"${k}" = ${v}`),
          join(' and ')
        )
        .else (a => '??')
      )))}`;

    const values = go(
      vals,
      map(match
        .case(isArray) (a => a)
        .case(a => typeof a == 'object') (Object.values)
        .else (a => a)
      ),
      cat);

    return {
      text,
      values
    };
  }

  function INSERT(strs, ...vals) {
    const table = strs[0];
    return function(objects) {
      objects = isArray(objects) ? objects : [objects];

      const cols = go(
        objects,
        first,
        Object.keys,
        map(a => `"${a}"`),
        join(', '),
        a => `(${a})`);

      const valsText = go(
        objects,
        map(pipe(
          map(_ => '??'),
          join(', '),
          a => `(${a})`
        )),
        join(', '));

      const vals = go(
        objects,
        map(values),
        cat);

      return {
        text: `INSERT INTO ${table} ${cols} VALUES ${valsText}`,
        values: vals
      };
    }
  }

  function UPDATE([table]) {
    return function(attrs) {
      const text = `UPDATE "${table}" SET ${go(
        attrs,
        Object.keys,
        map(k => `"${k}" = ??`))}`;

      const values = Object.values(attrs);

      return {
        text,
        values
      };
    }
  }

  const RALL = 'RETURNING *';

  class Query {
    constructor(text, values) {
      this.text = text;
      this.values = values;
    }
    static of(text, values) {
      return new Query(text, values);
    }
  }

  function Q(strs, ...vals) {
    return Query.of(
      strs.reduce((a, b) => `${a}??${b}`),
      vals);
  }

  // const { query, transaction } = Orm.connection();

  global.Orm = {
    CONNECT,
    SELECT,
    FROM,
    WHERE,
    INSERT,
    UPDATE,
    Q,
    PG_ARGS,
    RALL
  };
} ();