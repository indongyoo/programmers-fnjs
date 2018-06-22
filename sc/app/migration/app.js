require('../../module/share/base/Functional');
Object.assign(global, Functional);
require('../../module/back/orm/Orm');
const fs = require('fs');

(async () => {
  const { SELECT, FROM, WHERE, INSERT } = Orm;
  const { QUERY, TRANSACTION } = await Orm.CONNECT();

  const hasMigrations = pipe(
    _ => QUERY(
      SELECT `count(*) > 0 as has`,
      FROM `pg_tables`,
      WHERE `${{ schemaname: 'public', tablename: 'migrations' }}`
    ),
    first,
    isMatch({has: true})
  );

  const createMigrations = _ => QUERY(`
    CREATE TABLE migrations (
      id          serial PRIMARY KEY,
      name        varchar(255) NOT NULL,
      created_at  timestamptz  
    )
  `);

  await or(
    hasMigrations,
    createMigrations
  ) ();

  const migrations = await go(
    QUERY(
      SELECT `name`,
      FROM `migrations`
    ),
    map(m => m.name));

  const files = await go(
    './list',
    nodeF(fs.readdir),
    reject(contains(migrations))
  );

  const { QUERY_T, COMMIT, ROLLBACK } = await TRANSACTION();

  const migration = pipeT(
    map(fn => `./list/${fn}`),
    map(require),
    each(f => f(QUERY_T)),
    _ => files,
    map(name => ({ name/*, created_at: new Date()*/ })),
    files => QUERY_T(
      INSERT `migrations` (files)
    ),
    COMMIT,
    _ => log('성공!!')
  ).catch(
    e => log(e, '실패했네..;;'),
    ROLLBACK
  );

  await migration(files);

}) ();