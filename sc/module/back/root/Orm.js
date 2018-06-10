!function(Root) {
  const { Pool } = require('pg');

  function isString(a) {
    return typeof a == 'string';
  }

  function pgArgs(...qs) {
    return pgArgsArr(qs);
  }

  function pgArgsArr(qs) {
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
      pool.query(...pgArgsArr(qs)),
      match
        .case({command: 'SELECT'}) (res => res.rows)
        .else (_ => _)
    );
  }

  async function connect(info) {
    const pool = await new Pool(info);
    return {
      query(...qs) {
        return query(pool, qs);
      },
      async transaction() {
        const client = await pool.connect();
        await client.query('BEGIN');
        const end = query => _ => series([
          _ => client.query(query),
          _ => client.release()
        ]);
        return {
          queryT(...qs) {
            return query(client, qs);
          },
          COMMIT: end('COMMIT'),
          ROLLBACK: end('ROLLBACK')
        }
      }
    };
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

      const values = go(
        objects,
        map(pipe(
          Object.values,
          map(quote),
          join(', '),
          a => `(${a})`
        )),
        join(', '));

      return `INSERT INTO ${table} 
          ${cols} 
        VALUES 
          ${values}`;
    }
  }

  // const { query, transaction } = Orm.connection();

  Root.Orm = {
    connect,
    SELECT,
    FROM,
    WHERE,
    INSERT,
    pgArgs
  };
} (global);