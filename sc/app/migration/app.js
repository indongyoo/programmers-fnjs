require('../../module/share/root/Functional');
Object.assign(global, Functional);
require('../../module/back/root/Orm');
const fs = require('fs');

(async () => {
  const { SELECT, FROM, WHERE, INSERT } = Orm;
  const { query, transaction } = await Orm.connect();

  const hasMigrations = pipe(
    _ => query(
      SELECT `count(*) > 0 as has`,
      FROM `pg_tables`,
      WHERE `${{ schemaname: 'public', tablename: 'migrations' }}`
    ),
    first,
    isMatch({has: true})
  );

  const createMigrations = _ => query(`
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
    query(
      SELECT `name`,
      FROM `migrations`
    ),
    map(m => m.name));

  const files = await go(
    './list',
    nodeF(fs.readdir),
    reject(contains(migrations))
  );

  const { queryT, COMMIT, ROLLBACK } = await transaction();

  const migration = pipeT(
    map(fn => `./list/${fn}`),
    map(require),
    each(f => f(queryT)),
    _ => files,
    map(name => ({ name/*, created_at: new Date()*/ })),
    files => queryT(
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