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
      match
        .case({command: 'SELECT'}) (res => res.rows)
        .case({command: 'INSERT'}) (res => res.rows)
        .else (_ => _)
    );
  }

  async function CONNECT(info) {
    const pool = await new Pool(info);
    function QUERY(...qs) {
      return query(pool, qs);
    }
    return {
      QUERY,
      QUERY1: pipe(QUERY, first),
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

  const RALL = 'RETURNING *';

  // const { query, transaction } = Orm.connection();

  global.Orm = {
    CONNECT,
    SELECT,
    FROM,
    WHERE,
    INSERT,
    PG_ARGS,
    RALL
  };
} ();